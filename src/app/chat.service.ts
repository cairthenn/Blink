import CryptoJS from 'crypto-js';
import dateformat from 'dateformat';
import { Injectable } from '@angular/core';
import { IrcService } from './irc.service';
import { ChatMessage, MessagesComponent } from './messages/messages.component';
import { WebApiService as WebApiService } from './web-api.service';
import { SettingsService } from './settings.service';
import { ElectronService } from './electron.service';


@Injectable({
  providedIn: 'root'
})
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

    private userState: any = {};
    private roomState: any = {};
    private odd = true;

    public joined = false;
    public username = '';
    public channel = '';
    public channelDisplay = '';

    public userList: any = {};
    public badges: any = {};
    public cheers: any = {};
    public streamInfo: any = {};
    public channelInfo: any = {};

    public mentions = 0;
    public newMessages = false;

    public messages: ChatMessage[] = [];

    public commandHandlers = {
        me: (text) => {
            IrcService.sendMessage(this.channel, `.me ${text}`);
            const msg = this.processOutgoing(text, true);
            this.addMessage(msg);
        }
    };

    constructor(public settings: SettingsService) {

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


    public openExternal(url: string) {
        ElectronService.shell.openExternal(url);
    }


    public openStream() {
        if (!this.channel || !this.channel.length) {
            return;
        }
        this.openExternal(`https://www.twitch.tv/${this.channel}`);
    }

    private updateStreamInfo() {
        const key = this.key;
        WebApiService.getStream(this.channel, key).then(stream => {
            this.streamInfo = stream;
        });

        WebApiService.getChannel(this.channel, key).then(channel => {
            this.channelInfo = channel;
        });
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

    private updateUserList() {
        WebApiService.getUserList(this.channel).then(users => {
            this.userList = users;
            this.userList.autocomplete = [].concat(users.broadcaster, users.moderators, users.vips, users.staff, users.viewers).sort();
        });
    }

    private updateBadges() {
        WebApiService.getBadges(this.roomState['room-id']).then(badges => {
            this.badges = badges;
            this.updateIfActive();
        });
    }

    private updateCheers() {
        WebApiService.getCheers(this.roomState['room-id'], this.key).then(cheers => {
            this.cheers = cheers;
            this.updateIfActive();
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
        });
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
        });

    }

    private updateEmoteLookup() {
        this.emotes.lookup = {
            ...this.emotes.twitch.lookup,
            ...this.emotes.bttv.lookup,
            ...this.emotes.ffz.lookup
        };

        this.emotes.autocomplete = Object.keys(this.emotes.lookup).sort().map(x => [x.toLowerCase(), x]);
    }

    private onUserState(state: any) {
        if (this.userState['emote-sets'] !== state['emote-sets']) {
            this.updateEmotes(state['emote-sets']);
        }

        this.userState = state;
    }

    private onJoin() {
        this.addStatus('Welcome to the chat!');

        this.updateStreamInfo();
        this.updateUserList();
        this.updateFFZ();
        this.updateBTTV();

        this.updater = window.setInterval(() => {
            this.updateStreamInfo();
            this.updateUserList();
        }, 60000);
        this.joined = true;
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

        const notice = this.processNotice(params);
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

    private purge(params, user: string) {

        this.messages.forEach(msg => {
            if (!user || msg.username === user) {
                msg.deleted = true;
            }
        });

        if (!user) {
            this.addStatus('Chat was cleared by a moderator.');
        }
    }

    private deleteMessage(messageId: string) {

        this.messages.forEach(m => {
            if (m.id === messageId) {
                m.deleted = true;
            }
        });
    }

    private globalUserState(state: any) {
        const notice = this.processNotice(state);

        this.addMessage(notice);
    }


    public init(channel: string, username: string, token: string) {

        if (this.joined) {
            IrcService.part(this.channel);
            clearInterval(this.updater);
        }

        this.username = username;
        this.token = token;
        this.channelDisplay = channel;
        this.channel = channel.toLowerCase();

        IrcService.join(this.channel, {
            CLEARCHAT : (params, msg) => { this.purge(params, msg); },
            CLEARMSG : (_, msg) => { this.deleteMessage(msg); },
            GLOBALUSERSTATE: (params) => { this.globalUserState(params); },
            PRIVMSG: (params, msg) => { this.onMessage(params, msg); },
            ROOMSTATE: (params) => { this.onRoomState(params); },
            NOTICE: (params, msg) => { this.onNotice(params, msg); },
            USERNOTICE: (params, msg) => { this.onUserNotice(params, msg); },
            USERSTATE: (params) => { this.onUserState(params); },
            JOIN: () => { this.onJoin(); },
        });
    }

    public close() {
        if (this.joined) {
            IrcService.part(this.channel);
            clearInterval(this.updater);
        }
    }

    public updateView() {
        this.component.update();
    }

    public register(component: MessagesComponent) {
        this.component = component;
    }

    public addMessage(message: any) {
        if (this.messages.length > this.settings.maxHistory) {
            this.messages.shift();
        }

        const now = new Date();
        message.timestamp = dateformat(now, 'hh:MM');
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

        const commandCheck = /^[\.\/]([^ ]*)( .*)?$/.exec(trimmed);

        if (!commandCheck) {
            IrcService.sendMessage(this.channel, trimmed);
            const msg = this.processOutgoing(trimmed);
            this.addMessage(msg);
            return;
        }

        const handler = this.commandHandlers[commandCheck[1]];
        if (!handler) {
            IrcService.sendMessage(this.channel, commandCheck[1]);
            return;
        }

        handler[0](commandCheck[2]);
    }

    private parseTwitchEmotes(str: string) {

        if (!str || !str.length) {
            return {};
        }

        const split = str.split('/').map(x => {

            const match = /([\d]+):(.*)$/.exec(x);
            const locations = match[2].split(',').map(y => /^([\d]+)-([\d]+)$/.exec(y)[1]);
            const map = locations.reduce((obj, item) => {
                obj[item] = match[1];
                return obj;
            }, {});

            return map;
        });

        const merged = split.reduce((obj, item) => {
            return { ...obj, ...item };
        }, {});

        return merged;
    }


    private parseBadges(str: string) {

        if (!str || !str.length) {
            return [];
        }

        return str.split(',').map(x => x.split('/'));

    }

    private processNotice(params: any) {

        if (/^(?:sub|resub)$/.test(params['msg-id'])) {
            const months = params['msg-param-cumulative-months'];
            const shareStreak = params['msg-param-should-share-streak'] !== 0;
            const streakLength = params['msg-param-streak-months'];
            const plan = params['msg-param-sub-plan'];
            const isPrime = plan === 'Prime';
            const tier = isPrime ? 0 : plan / 1000;

            const tierMessage = isPrime ? 'with Twitch Prime' : `at Tier ${tier}`;
            const streakMessage = shareStreak ? `, currenlty on a ${streakLength} month streak` : '';
            const monthMessage = months > 1 ? ` They've subscribed for ${months} months${streakMessage}!` : '';
            const message = `subscribed ${tierMessage}.${monthMessage}`;

            return {
                subscription: true,
                subType: 0,
                prime: isPrime,
                subMessage: message,
            };

        } else if (/^(?:subgift|anonsubgift)$/.test(params['msg-id'])) {
            const tier = params['msg-param-sub-plan'] / 1000;
            const displayName = params['msg-param-recipient-display-name'];
            const message = `gifted a Tier ${tier} subscription to`;
            return {
                subscription: true,
                subType: 1,
                recipient: displayName,
                subMessage: message,
            };
        } else if (params['msg-id'] === 'submysterygift') {

            const tier = params['msg-param-sub-plan'] / 1000;
            const count = params['msg-param-mass-gift-count'];

            const amountMessage = count > 1 ? `${count} Tier ${tier} subscriptions` : `a Tier ${tier} subscription`;
            const message = `is gifting ${amountMessage} to `;

            return {
                subscription: true,
                subType: 2,
                communityGift: true,
                subMessage: message,
            };
        } else if (params['msg-id'] === 'raid') {
            return {
                raid: true,
                raider: params['msg-param-displayName'],
                viewers: params['msg-param-viewerCount'],
            };
        }

        return {
            notice: params['system-msg']
        };
    }

    private checkBits(word) {
        const bits = /([a-z]+)(\d+)/.exec(word);

        if (!bits) {
            return undefined;
        }

        const cheerType = bits[1];

        if (cheerType in this.cheers) {
            const spent = Number(bits[2]);
            const info = this.cheers[cheerType];
            const tier = Math.min(spent >= 10000 ? 4 :
                spent >= 5000 ? 3 :
                spent >= 1000 ? 2 :
                spent >= 100 ? 1 : 0, info.tiers.length - 1);
            const scale = info.scales.sort()[0];

            return {
                type: 'bits',
                name: bits[0],
                amount: spent,
                color: info.tiers[tier].color,
                dark: info.tiers[tier].images.dark.animated[scale],
                light: info.tiers[tier].images.light.animated[scale],
            };
        }
    }

    private checkUrl(word) {
        const regex = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9]{2,256}\.[A-Za-z]{2,6}/;
        return regex.test(word);
    }

    private processIncoming(params: any, original: string): any {

        const message = {
            id: params.id,
            username: params['display-name'],
            action: false,
            highlight: false,
            color: params.color,
            text: original,
            badges: this.parseBadges(params.badges),
            fragments: undefined,
            chat: false,
            friend: false,
        };

        if (!original || !original.length) {
            return message;
        }

        const isAction = /\u0001ACTION (.*)\u0001$/.exec(original);

        if (isAction) {
            original = isAction[1];
            message.action = true;
        }

        let cursor = 0;
        const emoteLocations = this.parseTwitchEmotes(params.emotes);
        const lowerUsername = params['display-name'].toLowerCase();

        message.chat = true;
        message.friend = this.settings.friendList.find(x => x === lowerUsername) && true;

        if (this.settings.ignoredUsers.find(x => x === lowerUsername)) {
            return;
        }

        let ignore = false;
        const fragments = original.split(' ').map(word => {
            if (ignore) {
                return;
            }

            const check = cursor;
            cursor += Array.from(word).length + 1;

            if (this.checkUrl(word)) {
                return {
                    type: 'url',
                    text: word,
                };
            }

            const lower = word.toLowerCase();

            ignore = this.settings.blacklistWords.find(x => x === lower) && true;

            if (params.bits) {
                const bits = this.checkBits(lower);
                if (bits) {
                    return bits;
                }
            }

            const username = /@([a-zA-Z0-9_]+)/.exec(word);
            const testWord = username ? username[1].toLowerCase() : lower;

            if (!message.highlight) {
                if (this.settings.highlightName && this.username === testWord) {
                    message.highlight = true;
                } else {
                    message.highlight = this.settings.highlightWords.find(x => x === testWord) && true;
                }
            }

            if (username) {
                return {
                    type: 'username',
                    text: word,
                    name: username[1],
                };
            } else if (check in emoteLocations) {
                return {
                    type: 'twitch',
                    src: `https://static-cdn.jtvnw.net/emoticons/v1/${emoteLocations[check]}/1.0`,
                    code: word,
                };
            } else if (this.emotes.lookup[word] && !this.emotes.lookup[word].userOnly) {
                return this.emotes.lookup[word];
            }

            return {
                type: 'text',
                text: word,
                color: isAction ? params.color : undefined,
             };
        });

        if (ignore) {
            return;
        }

        if (message.highlight && !this.active) {
            this.mentions++;
            if (this.settings.flash) {
                ElectronService.ipcRenderer.send('flash');
            }
        }

        message.fragments = fragments;

        return message;
    }

    private processOutgoing(original: string, isAction: boolean = false): any {

        const chatFrags = original.split(' ').map(word => {

            if (this.checkUrl(word)) {
                return {
                    type: 'url',
                    text: word,
                };
            }

            const username = /@([a-zA-Z0-9_]+)/.exec(word);

            if (username) {
                return {
                    type: 'username',
                    text: word,
                    name: username[1],
                };
            } else if (word in this.emotes.lookup) {
                return this.emotes.lookup[word];
            }

            return {
                type: 'text',
                color: isAction ? this.userState.color : undefined,
                text: `${word} `,
             };
        });

        const message = {
            action: isAction,
            username: this.username,
            chat: true,
            color: this.userState.color,
            text: original,
            fragments: chatFrags,
            badges: this.parseBadges(this.userState.badges),
        };

        return message;
    }
}
