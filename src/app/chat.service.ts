import CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';
import { IrcService } from './irc.service';
import { ChatMessage } from './messages/messages.component'
import { EmotesService } from './emotes.service';
import { SettingsService } from './settings.service';


const image_classes = "cc-chat-image cc-inline-block chat-line__message--emote"

const ffzHtml = function(id: string, name: string) {
    return `<img src="https://cdn.frankerfacez.com/emoticon/${id}/1" class="${image_classes}" alt="${name}"/> `
}
const bttvHtml = function(id: string, name: string) {
    return `<img src="https://cdn.betterttv.net/emote/${id}/1x" class="${image_classes}" alt="${name}"/> `
}
const twitchHtml = function(id: string, name: string) {
    return `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0" class="${image_classes}" alt="${name}"/> `
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {


    public joined: boolean = false;
    public username: string = '';
    
    public channelDisplay: string = '';
    public channel: string = '';
    public active: boolean = false;

    private token: string;

    private userState: any = {};
    private roomState: any = {};

    private userEmotes = [];
    private bttvEmotes = {};
    private ffzEmotes = {};
    private userList = {};
    public badges = {};
    
    public messages: ChatMessage[] = [];

    constructor(public settings: SettingsService) { }

    private updateUserList() {
        EmotesService.getUserList(this.channel).then(users => {
            this.userList = users;
        });
    }
    

    private updateBadges(state) {
        EmotesService.getBadges(state).then(badges => {
            this.badges = badges;
        })
    }

    private updateEmotes(sets: string) {
        const bytes = CryptoJS.AES.decrypt(this.token, this.username);
        const key = bytes.toString(CryptoJS.enc.Utf8);
        EmotesService.getTwitchEmotes(sets, key).then(emotes => {
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
        this.updateBadges(state['room-id']);
        this.updateUserList();
    }

    private onMessage(params: any, text: string) {
        const message = this.processIncoming(params, text);

        this.addMessage(message);
    }

    private onUserNotice(params: any, text: string) {
        //const message = this.processIncoming(params, text);
        //this.addMessage(message);
        if(text) {
            this.addStatus(`[TODO]: ${text}`);
        }

        console.log('user notice', text, params);
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
        console.log('purge', params, user);
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
        console.log(`Attemping to delete: ${messageId}`);
    }

    private globalUserState(state: any) {
        console.log(`Global user state:`, state);
    }


    public init(channel: string, username: string, token: string) {

        if(this.joined) {
            IrcService.part(this.channel);
        }

        this.username = username;
        this.token = token;
        this.channelDisplay = channel;
        this.channel = channel.toLowerCase();

        EmotesService.getBttvEmotes(this.channel).then(emotes => {
            this.bttvEmotes = emotes;
        })

        EmotesService.getFfzEmotes(this.channel).then(emotes => {
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

        if(isAction) {
            text = isAction[1];
        }
        
        
        const emote_locations = this.parseTwitchEmotes(params['emotes']);

        var cursor = 0;
        const html = text.split(' ').reduce((builder, word) => {

            if(word == this.username || word in this.settings.highlightWords) {
                highlight = true;
            }

            const check = cursor;
            cursor += Array.from(word).length + 1;
            if(check in emote_locations) {
                return `${builder}${twitchHtml(emote_locations[check], word)}`;
            } else if(word in this.bttvEmotes) {
                return `${builder}${bttvHtml(this.bttvEmotes[word].id, word)}`;
            } else if(word in this.ffzEmotes) {
                return `${builder}${ffzHtml(this.ffzEmotes[word].id, word)}`;
            } 
            return `${builder}${word} `;
        }, '').trim();

        const message = {
            username: params['display-name'], 
            isAction: isAction && true,
            highlight: highlight,
            isChat: true,
            color: params['color'],
            text: text,
            html: html,
            badges: this.parseBadges(params['badges']),
        };

        return message;
    }

    private processOutgoing(text: string, action: boolean = false) : any {

        const html = text.split(' ').reduce((builder, word) => {
            if(word in this.userEmotes) {
                return `${builder}${twitchHtml(this.userEmotes[word].id, word)}`;
            } else if(word in this.bttvEmotes) {
                return `${builder}${bttvHtml(this.bttvEmotes[word].id, word)}`;
            } else if(word in this.ffzEmotes) {
                return `${builder}${ffzHtml(this.ffzEmotes[word].id, word)}`;
            }
            return `${builder}${word} `;
        }, '');

        const message = {
            isAction: action,
            username: this.username, 
            isChat: true,
            color: this.userState['color'],
            text: text,
            html: html,
            badges: this.parseBadges(this.userState['badges']),
        };

        return message;
    }

    public commandHandlers = {
        'me': [],
    }

    public send(text: string) {
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

    public addMessage(message: any) {
        if(this.messages.length > this.settings.maxHistory) {
            this.messages.shift();
        }

        this.messages.push(message);
    }
}