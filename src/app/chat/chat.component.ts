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

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  @Input() public settings : SettingsComponent;

  public room_setup: boolean = false;

  public username: string = '';
  public color: string = '#FFFFFF';
  public moderator: boolean = false;
  public subscriber: boolean = false;
  public emote_sets: string = '';
  public badges: string = '';

  public lang: string = '';
  public emote_only: boolean = false;
  public followers_only: boolean = false;
  public r9k: boolean = false;
  public rituals: string = '';
  public room_id: string = '';
  public slow: number = 0;
  public sub_only: boolean = false;
  
  public channel: string = '';

  public messages: ChatMessage[] = [];
  
  private BTTVEmotes = {};
  private FFZEmotes = {};
  private Badges = {};

  constructor() { 
  }

  private user_state(state: any) {
    this.username = state.username;
    this.color = state.color;
    this.badges = state.badges;
    this.moderator = state.moderator != '0';
    this.subscriber = state.subscriber != '0';
    this.emote_sets = state.emote_sets;
  }
  
  private room_state(state: any) {

    this.lang = state.lang;
    this.emote_only = state.emote_only == '1';
    this.followers_only = state.followers_only == '1';
    this.r9k = state.r9k == '1';
    this.rituals = state.rituals;
    this.slow = state.slow;
    this.sub_only = state.sub_only == '1';
    this.room_id = state.room_id;
    this.Badges = EmotesService.get_badges(state.room_id);
  }

  private on_message(msg: any) {
    const message = this.process_incoming(msg);

    this.messages.push(message);
  }
  
  
  public init(name: string) {
    this.channel = name;
    IrcService.join(name, (msg: any) => {
      this.on_message(msg);
    }, (state: any) => {
      this.user_state(state);
    }, (state: any) => {
      this.room_state(state);
    });
  }

  private parse_twitch_emotes(str: string) {

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


  private parse_badges(str: string) {

    if(str.length == 0) {
      return [];
    }

    return str.split(',').map(x => {
      const badge_info = x.split('/');
      return badge_info[0] in this.Badges ? this.Badges[badge_info[0]][badge_info[1]] : null;
    })

  }

  private process_incoming(msg: any) : ChatMessage {
    
    const emote_locations = this.parse_twitch_emotes(msg.emotes);
    console.log(this.settings);
    var cursor = 0;
    const text = msg.message.split(' ').reduce((builder, word) => {
      if(cursor in emote_locations && this.settings.twitch_emotes) {
        builder += `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${emote_locations[cursor]}/1.0" class="cc-chat-image cc-inline-block" alt="${word}" style="hidden:{{!settings.twitch_emotes}}"/> `
      } else if(word in this.BTTVEmotes && this.settings.bttv) {
        const emote = this.BTTVEmotes[word];
        if(!this.settings.gifs && emote.type == '.gif'){
          builder += `${word} `;
        } else {
          builder += `<img src="https://cdn.betterttv.net/emote/${emote.id}/1x" class="cc-chat-image cc-inline-block" alt="${word}" style="hidden:{{!settings.bttv}}"/> `
        }
      } else if(word in this.FFZEmotes && this.settings.ffz) {
        const emote = this.FFZEmotes[word];
        builder += `<img src="https://cdn.frankerfacez.com/emoticon/${emote.id}/1" class="cc-chat-image cc-inline-block" alt="${word}" style="hidden:{{!settings.ffz}}"/> `
      } else {
        builder += `${word} `;
      }

      cursor += Array.from(word).length + 1;
      return builder;
    }, '').trim();

    const message = {
      username: msg.username, 
      color: msg.color,
      message: text,
      badges: this.parse_badges(this.badges),
    };

    return message;
  }

  private process_outgoing(text: string) : ChatMessage {
    const message = {
      username: this.username, 
      color: this.color,
      message: text,
      badges: this.parse_badges(this.badges),
    };

    return message;
  }

  public send(text: string) {

    const message = this.process_outgoing(text);

    this.messages.push(message);

    IrcService.send_message(this.channel, text);
  }
  
  ngOnInit() {
  }

}
