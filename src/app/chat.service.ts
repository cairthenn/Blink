import CryptoJS from 'crypto-js';
import dateformat from 'dateformat';
import { Injectable } from '@angular/core';
import { IrcService } from './irc.service';
import { ChatMessage, MessagesComponent } from './messages/messages.component'
import { WebApiService as WebApiService } from './web-api';
import { SettingsService } from './settings.service';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

    private _active = false;
    public joined: boolean = false;

    public username: string = '';
    private token: string = '';
    public channel: string = '';
    public channelDisplay: string = '';
    
    private userState: any = {};
    private roomState: any = {};

    
    private userEmotes: any = {};
    private bttvEmotes: any = {};
    private ffzEmotes : any = {};
    public userList: any = {};
    public badges: any = {};
    public streamInfo: any = {};
    public channelInfo: any = {};

    public mentions: number = 0;
    public newMessages: boolean = false;

    private component: MessagesComponent;
    private updater: number;
    private odd = true;
    
    public messages: ChatMessage[] = [];

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

    private updateStreamInfo() {
        const bytes = CryptoJS.AES.decrypt(this.token, this.username);
        const key = bytes.toString(CryptoJS.enc.Utf8);
        WebApiService.getStream(this.channel, key).then(stream => {
            this.streamInfo = stream;
        })

        WebApiService.getChannel(this.channel, key).then(channel => {
            this.channelInfo = channel;
        })
    }

    constructor(public settings: SettingsService) { 

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
        });
    }

    private updateBadges() {
        WebApiService.getBadges(this.roomState['room-id']).then(badges => {
            this.badges = badges;
            this.updateIfActive();
        })
    }

    private updateEmotes(sets: string) {
        const bytes = CryptoJS.AES.decrypt(this.token, this.username);
        const key = bytes.toString(CryptoJS.enc.Utf8);
        WebApiService.getTwitchEmotes(sets, key).then(emotes => {
            this.userEmotes = emotes;
        })
    }

    private onUserState(state: any) {
        if(this.userState['emote-sets'] !== state['emote-sets']) {
            this.updateEmotes(state['emote-sets']);
        }

        this.userState = state;
    }

    private onJoin() {
        this.addStatus('Welcome to the chat!');
        this.joined = true;
    }

    private onRoomState(state: any) {
        this.roomState = state;
        this.updateBadges();

    }

    private onMessage(params: any, text: string) {
        const message = this.processIncoming(params, text);

        this.addMessage(message);
    }

    private onUserNotice(params: any, text: string) {
        if(text) {
            this.addStatus(`[TODO]: ${text}`);
        }
    }

    private onNotice(params: any, text: string) {
        this.addStatus(text);
    }

    private addStatus(text: string) {
        this.addMessage({
            isStatus: true,
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
        this.updateStreamInfo();
        this.updateUserList();

        this.updater = window.setInterval(() => {
            this.updateStreamInfo();
            this.updateUserList();
        }, 60000);

        WebApiService.getBttvEmotes(this.channel).then(emotes => {
            this.bttvEmotes = emotes;
        })

        WebApiService.getFfzEmotes(this.channel).then(emotes => {
            this.ffzEmotes = emotes;
        })

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

    private parseTwitchEmotes(str: string) {

        if(str.length == 0) {
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

    private processIncoming(params: any, text: string) : any {
        
        const isAction = /\u0001ACTION (.*)\u0001$/.exec(text);
        var highlight = false;
        var ignore = false;

        if(isAction) {
            text = isAction[1];
        }
        
        var cursor = 0;
        const emote_locations = this.parseTwitchEmotes(params['emotes']);
        const fragments = text.split(' ').map(word => {

            const lower = word.toLowerCase();
            const username = /@(.*)/.exec(lower);
            const check = cursor;
            cursor += Array.from(word).length + 1;

            const testWord = username ? username[1] : lower;


            if(!highlight) {
                if(this.settings.highlightName && this.username == testWord) {
                    highlight = true;
                } else {
                    for(var i in this.settings.highlightWords) {
                        if(this.settings.highlightWords[i] == testWord) {
                            highlight = true;
                            break;
                        }
                    }
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
                    type: 'twitchEmote',
                    src: `https://static-cdn.jtvnw.net/emoticons/v1/${emote_locations[check]}/1.0`,
                    name: word,
                };
            } else if(word in this.bttvEmotes) {
                return {
                    type: 'bttvEmote',
                    src: `https://cdn.betterttv.net/emote/${this.bttvEmotes[word].id}/1x`,
                    name: word,
                };
            } else if(word in this.ffzEmotes) {
                return {
                    type: 'ffzEmote',
                    src: `https://cdn.frankerfacez.com/emoticon/${this.ffzEmotes[word].id}/1`,
                    name: word,
                };
            } 

            return {
                type: 'text',
                text: word,
                color: isAction ? params['color'] : undefined,
             }
        });

        if(highlight && !this.active) {
            this.mentions++;
        }

        const message = {
            id: params['id'],
            username: params['display-name'], 
            isAction: isAction && true,
            highlight: highlight,
            isChat: true,
            color: params['color'],
            text: text,
            fragments: fragments,
            badges: this.parseBadges(params['badges']),
        };

        return message;
    }

    private processOutgoing(text: string, action: boolean = false) : any {

        const fragments = text.split(' ').map(word => {

            if(word in this.userEmotes) {
                return {
                    type: 'twitchEmote',
                    src: `https://static-cdn.jtvnw.net/emoticons/v1/${this.userEmotes[word].id}/1.0`,
                    name: word,
                };
            } else if(word in this.bttvEmotes) {
                return {
                    type: 'bttvEmote',
                    src: `https://cdn.betterttv.net/emote/${this.bttvEmotes[word].id}/1x`,
                    name: word,
                };
            } else if(word in this.ffzEmotes) {
                return {
                    type: 'ffzEmote',
                    src: `https://cdn.frankerfacez.com/emoticon/${this.ffzEmotes[word].id}/1`,
                    name: word,
                };
            } 

            return {
                type: 'text',
                color: action ? this.userState['color'] : undefined,
                text: `${word} `,
             }
        });

        const message = {
            isAction: action,
            username: this.username, 
            isChat: true,
            color: this.userState['color'],
            text: text,
            fragments: fragments,
            badges: this.parseBadges(this.userState['badges']),
        };

        return message;
    }

    public commandHandlers = {
        'me': [],
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

    public updateView() {
        this.component.update();
    }

    public register(component: MessagesComponent) {
        this.component = component;
    }

    public addMessage(message: any) {
        if(this.messages.length > this.settings.maxHistory) {
            this.messages.shift();
        }

        const now = new Date();
        message.timestamp = dateformat(now, 'hh:MM');
        message.odd = this.odd = !this.odd;

        this.messages.push(message);
        
        if(!this.updateIfActive(true) && !message.isStatus) {
            this.newMessages = true;
        }
    }
}