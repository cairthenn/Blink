import CryptoJS from 'crypto-js';
import dateformat from 'dateformat';
import { Injectable } from '@angular/core';
import { IrcService } from './irc.service';
import { ChatMessage, MessagesComponent } from './messages/messages.component'
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
    }

    private token: string = '';
    private component: MessagesComponent;
    private updater: number;

    private userState: any = {};
    private roomState: any = {};
    private odd = true;

    public joined: boolean = false;
    public username: string = '';
    public channel: string = '';
    public channelDisplay: string = '';
    

    public userList: any = {};
    public badges: any = {};
    public cheers: any = {};
    public streamInfo: any = {};
    public channelInfo: any = {};

    public mentions: number = 0;
    public newMessages: boolean = false;
    
    public messages: ChatMessage[] = [];

    constructor(public settings: SettingsService) { 

    }

    private _active = false;
    set active(val: boolean) {
        if(val) {
            this.mentions = 0;
            this.newMessages = false;
            if(this.component) {
                setTimeout(() => this.component.updateAndScroll(), 25);
            }
        }

        this._active = val;
    }

    get active() {
        return this._active;
    }

    private get key () {
        const bytes = CryptoJS.AES.decrypt(this.token, this.username);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    
    private openExternal(url: string) {
        ElectronService.shell.openExternal(url);
    }


    public openStream() {
        if(!this.channel || this.channel.length == 0) {
            return;
        }
        this.openExternal(`https://www.twitch.tv/${this.channel}`);
    }

    private updateStreamInfo() {
        const key = this.key;
        WebApiService.getStream(this.channel, key).then(stream => {
            this.streamInfo = stream;
        })

        WebApiService.getChannel(this.channel, key).then(channel => {
            this.channelInfo = channel;
        })
    }

    private updateIfActive(scroll: boolean = false) {
        
        if(this.active && this.component) {
            if(scroll) {
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
            this.userList.autocomplete = [].concat(users.moderators, users.vips, users.staff, users.viewers).sort();
        });
    }

    private updateBadges() {
        WebApiService.getBadges(this.roomState['room-id']).then(badges => {
            this.badges = badges;
            this.updateIfActive();
        })
    }

    private updateCheers() {
        WebApiService.getCheers(this.roomState['room-id'], this.key).then(cheers => {
            this.cheers = cheers;
            this.updateIfActive();
        })
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
        })
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
        })
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
        })

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
        if(this.userState['emote-sets'] != state['emote-sets']) {
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
        if(!message) {
            return;
        }
        this.addMessage(message);
    }

    private onUserNotice(params: any, text: string) {
        
        const notice = this.processNotice(params);
        if(!this.settings.subs && notice.subscription) {
            return;
        }

        const message = this.processIncoming(params, text);

        if(!message) {
            return;
        }
        
        this.addMessage({ ...message, ...notice });
    }

    private onNotice(params: any, text: string) {
        this.addStatus(text);
    }

    private addStatus(text: string) {
        this.addMessage({
            status: true,
            text: text,
        });
    }

    private purge(params, user: string) {

        this.messages.forEach(msg => {
            if(!user || msg.username == user) {
                msg.deleted = true;
            }
        })

        if(!user) {
            this.addStatus('Chat was cleared by a moderator.')
        }
    }

    private deleteMessage(messageId: string) {

        this.messages.forEach(m => { 
            if(m.id == messageId) {
                m.deleted = true;
            }
        });
    }

    private globalUserState(state: any) {

    }


    public init(channel: string, username: string, token: string) {

        if(this.joined) {
            IrcService.part(this.channel);
            clearInterval(this.updater);
        }

        this.username = username;
        this.token = token;
        this.channelDisplay = channel;
        this.channel = channel.toLowerCase();

        IrcService.join(this.channel, {
            'CLEARCHAT' : (params, msg) => { this.purge(params, msg); },
            'CLEARMSG' : (_, msg) => { this.deleteMessage(msg); },
            'GLOBALUSERSTATE': (params) => { this.globalUserState(params); },
            'PRIVMSG': (params, msg) => { this.onMessage(params, msg); },
            'ROOMSTATE': (params) => { this.onRoomState(params); },
            'NOTICE': (params, msg) => { this.onNotice(params, msg); },
            'USERNOTICE': (params, msg) => { this.onUserNotice(params, msg); },
            'USERSTATE': (params) => { this.onUserState(params); },
            'JOIN': () => { this.onJoin(); },
        });
    }

    public close() {
        if(this.joined) {
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

    public commandHandlers = {
        'me': [],
    }

    public addMessage(message: any) {
        if(this.messages.length > this.settings.maxHistory) {
            this.messages.shift();
        }

        const now = new Date();
        message.timestamp = dateformat(now, 'hh:MM');
        message.odd = this.odd = !this.odd;

        this.messages.push(message);
        
        if(!this.updateIfActive(true) && !message.status) {
            this.newMessages = true;
        }
    }

    public send(text: string) {
        
        if(!this.joined) {
            this.addStatus('You were unable to send a message.')
        }
        
        const trimmed = text.trim().replace(/\r?\n/, ' ');
        if(trimmed.length > 0) {
            
            const commandCheck = /^[\./]([^ ]*)/.exec(trimmed);

            if(commandCheck) {

                if(commandCheck[1] in this.commandHandlers) {
                    const command = this.commandHandlers[commandCheck[1]]
                }
            }
            
            IrcService.sendMessage(this.channel, trimmed);
            const msg = this.processOutgoing(trimmed);
            this.addMessage(msg);
        }
    }

    private parseTwitchEmotes(str: string) {

        if(!str || str.length == 0) {
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

        if(str == undefined || str.length == 0) {
            return [];
        }

        return str.split(',').map(x => x.split('/'))

    }

    private processNotice(params: any) {
        
        if(/^(?:sub|resub)$/.test(params['msg-id'])) {
            const months = params['msg-param-cumulative-months'];
            const shareStreak = params['msg-param-should-share-streak'] != 0;
            const streakLength = params['msg-param-streak-months'];
            const plan = params['msg-param-sub-plan'];
            const prime = plan == 'Prime';
            const tier = prime ? 0 : plan / 1000;

            const tierMessage = prime ? 'with Twitch Prime' : `at Tier ${tier}`;
            const streakMessage = shareStreak ? `, currenlty on a ${streakLength} month streak` : '';
            const monthMessage = months > 1 ? ` They've subscribed for ${months} months${streakMessage}!` : '';
            const message = `subscribed ${tierMessage}.${monthMessage}`

            return {
                subscription: true,
                subType: 0,
                prime: prime,
                subMessage: message,
            }
        } else if(/^(?:subgift|anonsubgift)$/.test(params['msg-id'])) {
            const tier = params['msg-param-sub-plan'] / 1000;
            const recipient = params['msg-param-recipient-user-name'];
            const message = `gifted a Tier ${tier} subscription to`
            return {
                subscription: true,
                subType: 1,
                recipient: recipient,
                subMessage: message,
            }
        } else if(params['msg-id'] == 'submysterygift') {

            const tier = params['msg-param-sub-plan'] / 1000;
            const count = params['msg-param-mass-gift-count'];

            const amountMessage = count > 1 ? `${count} Tier ${tier} subscriptions` : `a Tier ${tier} subscription`;
            const message = `is gifting ${amountMessage} to `

            return {
                subscription: true,
                subType: 2,
                communityGift: true,
                subMessage: message,
            }
        } else if(params['msg-id'] == 'raid') {
            return {
                raid: true,
                raider: params['msg-param-displayName'],
                viewers: params['msg-param-viewerCount'],
            }
        }

        return {};
    }

    private checkBits(word) {
        const bits = /([a-z]+)(\d+)/.exec(word); 
        
        if(!bits) {
            return undefined;
        }
            
        const cheerType = bits[1];

        if(cheerType in this.cheers) {
            const amount = Number(bits[2]);
            const info = this.cheers[cheerType];
            const tier = Math.min(amount >= 10000 ? 4 :
                amount >= 5000 ? 3 :
                amount >= 1000 ? 2 :
                amount >= 100 ? 1 : 0, info.tiers.length - 1);
            const scale = info.scales[0];

            return {
                type: 'bits',
                name: bits[0],
                amount: amount,
                color: info.tiers[tier].color,
                dark: info.tiers[tier].images.dark.animated[scale],
                light: info.tiers[tier].images.light.animated[scale],
            }
        }
    }

    private processIncoming(params: any, text: string) : any {

        const message = {
            id: params['id'],
            username: params['display-name'], 
            action: false,
            highlight: false,
            color: params['color'],
            text: text,
            badges: this.parseBadges(params['badges']),
            fragments: undefined,
            chat: false,
            friend: false,
        };

        if(!text || text.length == 0) {
            return message;
        }

        const isAction = /\u0001ACTION (.*)\u0001$/.exec(text);

        if(isAction) {
            text = isAction[1];
            message.action = true;
        }
        
        var cursor = 0;
        const emote_locations = this.parseTwitchEmotes(params['emotes']);
        const lowerUsername = params['display-name'].toLowerCase();

        message.chat = true;
        message.friend = this.settings.friendList.find(x => x == lowerUsername) && true;
       
        if(this.settings.ignoredUsers.find(x => x == lowerUsername)) {
            return;
        }

        var ignore = false;
        const fragments = text.split(' ').map(word => {
            if(ignore) {
                return;
            }

            const check = cursor;
            cursor += Array.from(word).length + 1;
            const lower = word.toLowerCase();

            ignore = this.settings.blacklistWords.find(x => x == lower) && true;

            if(params.bits) {
                const bits = this.checkBits(lower);
                if(bits) {
                    return bits;
                }
            }

            const username = /@([a-zA-Z0-9_]+)/.exec(word);
            const testWord = username ? username[1].toLowerCase() : lower;

            if(!message.highlight) {
                if(this.settings.highlightName && this.username == testWord) {
                    message.highlight = true;
                } else {
                    message.highlight = this.settings.highlightWords.find(x => x == testWord) && true;
                }
            }

            if(username) {
                return {
                    type: 'username',
                    text: word,
                    name: username[1],
                }
            } else if(check in emote_locations) {
                return {
                    type: 'twitch',
                    src: `https://static-cdn.jtvnw.net/emoticons/v1/${emote_locations[check]}/1.0`,
                    name: word,
                };
            } else if(this.emotes.lookup[word] && !this.emotes.lookup[word].userOnly) {
                return this.emotes.lookup[word];
            } 

            return {
                type: 'text',
                text: word,
                color: isAction ? params['color'] : undefined,
             }
        });

        if(ignore) {
            return;
        }

        if(message.highlight && !this.active) {
            this.mentions++;
            if(this.settings.flash) {
                ElectronService.ipcRenderer.send('flash');
            }
        }

        message.fragments = fragments;

        return message;
    }

    private processOutgoing(text: string, action: boolean = false) : any {

        const fragments = text.split(' ').map(word => {

            const username = /@([a-zA-Z0-9_]+)/.exec(word);

            if(username) {
                return {
                    type: 'username',
                    text: word,
                    name: username[1],
                }
            } else if(word in this.emotes.lookup) {
                return this.emotes.lookup[word];
            }

            return {
                type: 'text',
                color: action ? this.userState['color'] : undefined,
                text: `${word} `,
             }
        });

        const message = {
            action: action,
            username: this.username, 
            chat: true,
            color: this.userState['color'],
            text: text,
            fragments: fragments,
            badges: this.parseBadges(this.userState['badges']),
        };

        return message;
    }
}