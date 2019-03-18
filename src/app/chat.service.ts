/*
    Blink, a chat client for Twitch
    Copyright (C) 2019 cairthenn

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import CryptoJS from 'crypto-js';
import dateformat from 'dateformat';
import { IrcService } from './irc.service';
import { MessagesComponent } from './messages/messages.component';
import { WebApiService as WebApiService } from './web-api.service';
import { SettingsService } from './settings.service';
import { ElectronService } from './electron.service';
import { Message } from './message';

export class ChatService {

    public emotes = {
        ffz: {
            global: [],
            channel: [],
            lookup: {},
        },
        bttv: {
            global: [],
            channel: [],
            lookup: {},
        },
        twitch: {
            sets: {},
            lookup: {},
        },
        lookup: {},
        autocomplete: [],
    };

    private token = '';
    private component: MessagesComponent;
    private updater: number;

    private colors = [];
    private userState: any = {};
    private roomState: any = {};

    public joined = false;
    public level = 0;
    public username = '';
    public channel = '';
    public channelDisplay = '';
    public userBadges = [];

    public userList: any = {};
    public badges: any = {};
    public cheers: any = {};
    public streamInfo: any = {};
    public channelInfo: any = {};

    public mentions = 0;
    public newMessages = false;

    public messages: any[] = [];
    private odd = false;

    public commandHandlers = {
        me: (text: string) => {
            if(!text || !text.length) {
                return;
            }
            const msg = this.processOutgoing(text, true);
            this.irc.sendMessage(this.channel, `.me ${msg.text}`);
            this.addMessage(msg);
        }
    };

    constructor(public settings: SettingsService, private irc: IrcService) {

    }

    private activeProxy = false;
    set active(val: boolean) {
        if (val) {
            this.mentions = 0;
            this.newMessages = false;
            if (this.component) {
                setTimeout(() => this.component.updateAndScroll(), 25);
            }
        }

        this.activeProxy = val;
    }

    get active() {
        return this.activeProxy;
    }

    private get key() {
        const bytes = CryptoJS.AES.decrypt(this.token, this.username);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    public purge(username: string) {
        this.irc.sendMessage(this.channel, `.timeout ${username} 1`);
    }

    public delete(id: string) {
        this.irc.sendMessage(this.channel, `.delete ${id}`);
    }

    public unTimeout(username: string) {
        this.irc.sendMessage(this.channel, `.untimeout ${username}`);
    }

    public timeout(username: any, timeoutTime: number) {
        this.irc.sendMessage(this.channel, `.timeout ${username} ${timeoutTime}`);
    }

    public unban(username: string) {
        this.irc.sendMessage(this.channel, `.unban ${username}`);
    }

    public ban(username: string) {
        this.irc.sendMessage(this.channel, `.ban ${username}`);
    }

    public openExternal(url: string) {
        ElectronService.shell.openExternal(url);
    }

    public openStream() {
        if (!this.channel || !this.channel.length) {
            return;
        }
        this.openExternal(`https://www.twitch.tv/${this.channel}`);
    }

    private updateIfActive(scroll: boolean = false) {

        if (this.active && this.component) {
            if (scroll) {
                this.component.updateAndScroll();
            } else {
                this.component.update();
            }
            return true;
        }

        return false;
    }

    private updateEmotes(sets: string) {
        const bytes = CryptoJS.AES.decrypt(this.token, this.username);
        const key = bytes.toString(CryptoJS.enc.Utf8);
        WebApiService.getTwitchEmotes(sets, key).then(emotes => {
            this.emotes.twitch.sets = emotes;
            this.emotes.twitch.lookup = emotes.reduce((obj, arr) => {
                arr[1].forEach(e => {
                    obj[e.code] = e;
                });
                return obj;
            }, {});
            this.updateEmoteLookup();
        }).catch(err => {
            console.log(`Error fetching Twitch emotes: ${err}`);
        });

    }

    private updateStreamInfo() {
        const key = this.key;
        WebApiService.getStream(this.channel, key).then(stream => {
            this.streamInfo = stream;
        }).catch(err => {
            console.log(`Error fetching stream info: ${err}`);
        });

        WebApiService.getChannel(this.channel, key).then(channel => {
            this.channelInfo = channel;
        }).catch(err => {
            console.log(`Error fetching channel info: ${err}`);
        });
    }

    private updateCheers() {
        WebApiService.getCheers(this.roomState['room-id'], this.key).then(cheers => {
            this.cheers = cheers;
            this.updateIfActive();
        }).catch(err => {
            console.log(`Error fetching cheers: ${err}`);
        });
    }

    private updateFFZ() {
        WebApiService.getFfzEmotes(this.channel).then(emotes => {
            this.emotes.ffz.channel = emotes[0];
            this.emotes.ffz.global = emotes[1];
            this.emotes.ffz.lookup = emotes.flat().reduce((obj, item) => {
                obj[item.code] = item;
                return obj;
            }, {});
            this.updateEmoteLookup();
        }).catch(err => {
            console.log(`Error fetching FFZ emotes: ${err}`);
        });
    }

    private updateBTTV() {
        WebApiService.getBttvEmotes(this.channel).then(emotes => {
            this.emotes.bttv.channel = emotes[0];
            this.emotes.bttv.global = emotes[1];
            this.emotes.bttv.lookup = emotes.flat().reduce((obj, item) => {
                obj[item.code] = item;
                return obj;
            }, {});
            this.updateEmoteLookup();
        }).catch(err => {
            console.log(`Error fetching BTTV emotes: ${err}`);
        });
    }

    private updateUserList() {
        WebApiService.getUserList(this.channel).then(users => {
            this.userList = users;
            this.userList.autocomplete = [].concat(users.broadcaster, users.moderators, users.vips, users.staff, users.viewers).sort();
        }).catch(err => {
            console.log(`Error fetching users: ${err}`);
        });
    }

    private updateBadges() {
        WebApiService.getBadges(this.roomState['room-id']).then(badges => {
            this.badges = badges;
            this.updateIfActive();
        }).catch(err => {
            console.log(`Error fetching badges: ${err}`);
        });
    }

    private updateEmoteLookup() {
        this.emotes.lookup = {
            ...this.emotes.twitch.lookup,
            ...this.emotes.bttv.lookup,
            ...this.emotes.ffz.lookup,
        };

        this.emotes.autocomplete = Object.keys(this.emotes.lookup).sort().map(x => {
            return [ this.emotes.lookup[x].lower, x ];
        });
    }

    private onUserState(state: any) {
        if (this.userState['emote-sets'] !== state['emote-sets']) {
            this.updateEmotes(state['emote-sets']);
        }

        this.userState = state;
        this.userBadges = Message.parseBadges(state.badges);
        this.level = this.checkUserLevel(this.userBadges);
        this.colors = Message.colorCorrect(state.color);
    }

    private onJoin() {
        this.addStatus('Welcome to the chat!');
        this.joined = true;
        this.updateStreamInfo();
        this.updateUserList();
        this.updateFFZ();
        this.updateBTTV();
        this.joined = true;
        this.updater = window.setInterval(() => {
            this.updateStreamInfo();
            this.updateUserList();
        }, 60000);
    }

    private onRoomState(state: any) {
        this.roomState = state;
        this.updateBadges();
        this.updateCheers();
    }

    private onMessage(params: any, text: string) {
        const message = this.processIncoming(params, text);
        if (!message) {
            return;
        }
        this.addMessage(message);
    }

    private onUserNotice(params: any, text: string) {
        const notice = Message.processNotice(params);
        if (!this.settings.subs && notice.subscription) {
            return;
        }

        const message = this.processIncoming(params, text);

        if (!message) {
            return;
        }

        this.addMessage({ ...message, ...notice });
    }

    private onNotice(params: any, text: string) {
        this.addStatus(text);
    }

    private addStatus(status: string) {
        this.addMessage({
            status: true,
            text: status,
        });
    }

    public deleteFromUser(id?: string) {
        this.messages.forEach(msg => {
            if (!id || msg.userId === id) {
                msg.deleted = true;
            }
        });

    }

    private onPurge(params, user: string) {

        this.deleteFromUser(user && params['target-user-id']);
        this.updateView();
        if (!user) {
            this.addStatus('Chat was cleared by a moderator.');
        } else if (params['ban-duration']) {
            this.addStatus(`${user} was timed out for ${params['ban-duration']} seconds.`);
        } else {
            this.addStatus(`${user} was banned from the channel.`);
        }
    }

    private onDeleteMessage(messageId: string) {

        this.messages.forEach(m => {
            if (m.id === messageId) {
                m.deleted = true;
            }
        });
        this.updateView();
    }

    private onGlobalUserState(state: any) {
        const notice = Message.processNotice(state);

        this.addMessage(notice);
    }

    public init(channel: string, username: string, token: string) {

        if (this.joined) {
            this.irc.part(this.channel);
            clearInterval(this.updater);
        }

        this.username = username;
        this.token = token;
        this.channelDisplay = channel;
        this.channel = channel.toLowerCase();

        this.irc.join(this.channel, {
            CLEARCHAT : (params, msg) => { this.onPurge(params, msg); },
            CLEARMSG : (_, msg) => { this.onDeleteMessage(msg); },
            GLOBALUSERSTATE: (params) => { this.onGlobalUserState(params); },
            PRIVMSG: (params, msg) => { this.onMessage(params, msg); },
            ROOMSTATE: (params) => { this.onRoomState(params); },
            NOTICE: (params, msg) => { this.onNotice(params, msg); },
            USERNOTICE: (params, msg) => { this.onUserNotice(params, msg); },
            USERSTATE: (params) => { this.onUserState(params); },
            JOIN: () => { this.onJoin(); },
            CLOSE: () => { this.addStatus('Connection lost. Attempting to reconnect.'); },
            RECONNECT: () => { this.addStatus('Reconnected.'); }
        });
    }

    public close() {
        if (this.joined) {
            this.irc.part(this.channel);
            clearInterval(this.updater);
        }
    }

    public updateView() {
        if (!this.component) {
            return;
        }

        this.component.update();
    }

    public register(component: MessagesComponent) {
        this.component = component;
    }

    public addMessage(message: any) {
        if (this.messages.length > this.settings.maxHistory) {
            this.messages.shift();
        }

        message.odd = this.odd = !this.odd;

        this.messages.push(message);

        if (!this.updateIfActive(true) && !message.status) {
            this.newMessages = true;
        }
    }

    public send(text: string) {

        if (!this.joined) {
            this.addStatus('You were unable to send a message.');
        }

        const trimmed = text.trim().replace(/\r?\n/, ' ');
        if (trimmed.length <= 0) {
            return;
        }

        const commandCheck = /^[\.\/]([^\. ]+)(?: (.*))?$/.exec(trimmed);

        if (!commandCheck) {
            const msg = this.processOutgoing(trimmed);
            this.irc.sendMessage(this.channel, msg.text);
            this.addMessage(msg);
            return;
        }

        const handler = this.commandHandlers[commandCheck[1]];
        if (!handler) {
            this.irc.sendMessage(this.channel, commandCheck[0]);
            return;
        }

        handler(commandCheck[2]);
    }

    private checkUserLevel(badges) {

        for (const i of Object.keys(badges)) {
            const badge = badges[i];
            if (badge[0] === 'moderator') {
                return 1;
            } else if (badge[0] === 'broadcaster') {
                return 2;
            } else if (badge[0] === 'staff') {
                return 3;
            }
        }

        return 0;
    }

    private processIncoming(params: any, original: string): any {

        const message = Message.fromIncoming(original, params, this.emotes, this.cheers, this.settings);

        if (message.highlight && !this.active) {
            this.mentions++;
            if (this.settings.flash) {
                const window = ElectronService.remote.getCurrentWindow();
                window.once('focus', () => window.flashFrame(false));
                window.flashFrame(true);
            }
        }

        return message;
    }

    private processOutgoing(original: string, isAction: boolean = false): any {
        return Message.fromOutgoing(this.username, original, this.colors, this.badges, this.emotes, isAction); 
    }
}
