import { Injectable, Input } from '@angular/core';
import { IrcService } from './irc.service';
import { ChatMessage } from './chat/chat.component';
import { EmotesService } from './emotes.service';
import { SettingsComponent } from './settings/settings.component';
import CryptoJS from 'crypto-js';


const image_classes = "cc-chat-image cc-inline-block .chat-line__message--emote"

const ffzHtml = function(id: string, name: string) {
    return `<img src="https://cdn.frankerfacez.com/emoticon/${id}/1" class="${image_classes}" alt="${name}" [style.hidden]="!settings.ffz"/> `
}
const bttvHtml = function(id: string, name: string) {
    return `<img src="https://cdn.betterttv.net/emote/${id}/1x" class="${image_classes}" alt="${name}" [style.hidden]="!settings.bttv"/> `
}
const twitchHtml = function(id: string, name: string) {
    return `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0" class="${image_classes}" alt="${name}" [style.hidden]="!settings.twitchEmotes"/> `
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {


    public roomSetup: boolean = false;
    public username: string = '';
    public color: string = '#FFFFFF';
    public moderator: boolean = false;
    public subscriber: boolean = false;
    public emoteSets: string = '';
    public badgeSets: string = '';

    public lang: string = '';
    public emoteOnly: boolean = false;
    public followersOnly: boolean = false;
    public r9k: boolean = false;
    public rituals: string = '';
    public roomId: string = '';
    public slow: number = 0;
    public subOnly: boolean = false;
    
    public channelDisplay: string = '';
    public channel: string = '';
    public active: boolean = false;
    public initialized: boolean = false;

    private token: string;

    private bttvEmotes = {};
    private ffzEmotes = {};
    private twitchEmotes = [];
    private badges = {};
    private users = {};

    
    public messages: ChatMessage[] = [];

    constructor(public settings: SettingsComponent) { }

    private userState(state: any) {
        //this.username = state.username;
        this.color = state.color;
        this.badgeSets = state.badges;
        this.moderator = state.moderator != '0';
        this.subscriber = state.subscriber != '0';
        if(this.emoteSets !== state.emoteSets) {
        
            const bytes = CryptoJS.AES.decrypt(this.token, this.username);
            const key = bytes.toString(CryptoJS.enc.Utf8);
            EmotesService.getTwitchEmotes(state.emoteSets, key).then(emotes => {
                this.twitchEmotes = emotes;
            })
        }
        this.emoteSets = state.emoteSets;
    }

    private updateUserList() {
        EmotesService.getUserList(this.channel).then(users => {
            this.users = users;
        });
    }

    private updateBadges() {
        EmotesService.getBadges(this.roomId).then(badges => {
            this.badges = badges;
        })
    }

    private roomState(state: any) {
        this.initialized = true;
        this.lang = state.lang;
        this.emoteOnly = state.emoteOnly == '1';
        this.followersOnly = state.followersOnly == '1';
        this.r9k = state.r9k == '1';
        this.rituals = state.rituals;
        this.slow = state.slow;
        this.subOnly = state.subOnly == '1';
        this.roomId = state.roomId;
        this.updateBadges();
        this.updateUserList();
    }

    private onMessage(msg: any) {
        const message = this.processIncoming(msg);

        this.addMessage(message);
    }


    public init(channel: string, username: string, token: string) {

        if(this.initialized) {
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

        IrcService.join(this.channel, (msg: any) => {
            this.onMessage(msg);
        }, (state: any) => {
            this.userState(state);
        }, (state: any) => {
            this.roomState(state);
        });
    }

    public close() {
        if(this.initialized) {
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

        if(str.length == 0) {
            return [];
        }

        return str.split(',').map(x => {
            const badge_info = x.split('/');
            return badge_info[0] in this.badges ? this.badges[badge_info[0]].versions[badge_info[1]].image_url_1x : null;
        })

    }

    private processIncoming(msg: any) : ChatMessage {
        
        const emote_locations = this.parseTwitchEmotes(msg.emotes);

        var cursor = 0;
        const text = msg.message.split(' ').reduce((builder, word) => {
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
            username: msg.username, 
            color: msg.color,
            message: text,
            badges: this.parseBadges(msg.badges),
        };

        return message;
    }

    private processOutgoing(text: string) : ChatMessage {

        const html = text.split(' ').reduce((builder, word) => {
            // Probably a more efficient way to handle this,
            // twitch passes back regex for base emotes like :)
            // to allow for :-), etc.
            const match = this.twitchEmotes.find(element => {
                return new RegExp(element.code).test(word);
            });

            if(match != undefined) {
                return `${builder}${twitchHtml(match.id, word)}`;
            }
            
            if(word in this.bttvEmotes) {
                return `${builder}${bttvHtml(this.bttvEmotes[word].id, word)}`;
            } else if(word in this.ffzEmotes) {
                return `${builder}${ffzHtml(this.ffzEmotes[word].id, word)}`;
            }
            return `${builder}${word} `;
        }, '');

        const message = {
            username: this.username, 
            color: this.color,
            message: html,
            badges: this.parseBadges(this.badgeSets),
        };

        return message;
    }

    public send(text: string) {
        const trimmed = text.trim();
        if(trimmed.length > 0) {
            IrcService.sendMessage(this.channel, trimmed);
            
            new Promise((resolve) => {
                resolve(this.processOutgoing(trimmed));
            }).then((msg: ChatMessage) => {
                this.addMessage(msg);
            }).catch(err => {
                console.log(`Error processing message: ${err}`);
            })
        }
    }

    public addMessage(message: ChatMessage) {

        if(this.messages.length > this.settings.maxHistory) {
            this.messages.shift();
        }

        this.messages.push(message);
    }
}