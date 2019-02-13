import { Component, OnInit, Input } from '@angular/core';
import { IrcService } from '../irc.service';
import { SettingsComponent } from '../settings/settings.component';
import { EmotesService } from '../emotes.service';


export interface ChatMessage {
  username: string;
  color: string;
  message: string;
  badges: string[];
}

export interface Info {
  title: string;
  picture: string;
  views: number;
}


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


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  @Input() public settings : SettingsComponent;

  public roomSetup: boolean = false;

  public username: string = '';
  public color: string = '#FFFFFF';
  public moderator: boolean = false;
  public subscriber: boolean = false;
  public emoteSets: string = '';
  public badges: string = '';

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

  public messages: ChatMessage[] = [];
  
  private BTTVEmotes = {};
  private FFZEmotes = {};
  private TwitchEmotes = {};
  private Badges = {};

  constructor() { 
  }

  private userState(state: any) {
    this.username = state.username;
    this.color = state.color;
    this.badges = state.badges;
    this.moderator = state.moderator != '0';
    this.subscriber = state.subscriber != '0';
    this.emoteSets = state.emoteSets;
  }
  
  private roomState(state: any) {

    this.lang = state.lang;
    this.emoteOnly = state.emoteOnly == '1';
    this.followersOnly = state.followersOnly == '1';
    this.r9k = state.r9k == '1';
    this.rituals = state.rituals;
    this.slow = state.slow;
    this.subOnly = state.subOnly == '1';
    this.roomId = state.roomId;
    EmotesService.getBadges(state.roomId).then(badges => {
      this.Badges = badges;
    })
  }

  private onMessage(msg: any) {
    const message = this.processIncoming(msg);

    this.addMessage(message);
  }
  
  
  public init(name: string) {
    this.channelDisplay = name;
    this.channel = name.toLowerCase();

    EmotesService.getBttvEmotes(this.channel).then(emotes => {
      console.log(emotes);
      this.BTTVEmotes = emotes;
    })

    EmotesService.getFfzEmotes(this.channel).then(emotes => {
      console.log(emotes);
      this.FFZEmotes = emotes;
    })

    IrcService.join(name, (msg: any) => {
      this.onMessage(msg);
    }, (state: any) => {
      this.userState(state);
    }, (state: any) => {
      this.roomState(state);
    });
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
      return badge_info[0] in this.Badges ? this.Badges[badge_info[0]].versions[badge_info[1]].image_url_1x : null;
    })

  }

  private processIncoming(msg: any) : ChatMessage {
    
    const emote_locations = this.parseTwitchEmotes(msg.emotes);

    var cursor = 0;
    const text = msg.message.split(' ').reduce((builder, word) => {
      const check = cursor;
      cursor += Array.from(word).length + 1;
      if(check in emote_locations) {
        return `${builder}${twitchHtml(emote_locations[cursor], word)}`;
      } else if(word in this.BTTVEmotes) {
        return `${builder}${bttvHtml(this.BTTVEmotes[word].id, word)}`;
      } else if(word in this.FFZEmotes) {
        return `${builder}${ffzHtml(this.FFZEmotes[word].id, word)}`;
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
      if(word in this.TwitchEmotes) {
        return `${builder}${twitchHtml(this.TwitchEmotes[word].id, word)}`;
      } else if(word in this.BTTVEmotes) {
        return `${builder}${bttvHtml(this.BTTVEmotes[word].id, word)}`;
      } else if(word in this.FFZEmotes) {
        return `${builder}${ffzHtml(this.FFZEmotes[word].id, word)}`;
      }
      return `${builder}${word} `;
    }, '');

    const message = {
      username: this.username, 
      color: this.color,
      message: html,
      badges: this.parseBadges(this.badges),
    };

    return message;
  }

  public send(text: string) {
    const trimmed = text.trim();
    if(trimmed.length > 0) {
      const message = this.processOutgoing(trimmed);
      this.addMessage(message);
      IrcService.sendMessage(this.channel, trimmed);
    }
  }

  public addMessage(message: ChatMessage) {

    if(this.messages.length > this.settings.maxHistory) {
      this.messages.shift();
    }

    this.messages.push(message);
  }

  // Scrolling

  public wantsToScroll : boolean = false;
  private _scrollHeight: number;
  private _scrollTop: number;

  get scrollHeight() {
    return this._scrollHeight;
  }

  @Input() set scrollHeight (n: number) {
    this._scrollHeight = n;
  }

  get scroll_top() {
    return this._scrollTop;
  }

  @Input() set scrollTop (n: number) {
    this._scrollTop = n;
  }

  public handleScroll(event: any) {

  }
  
  ngOnInit() {

  }

}
