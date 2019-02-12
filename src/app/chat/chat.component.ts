import { Component, OnInit } from '@angular/core';
import { IrcService } from '../irc.service';

export interface ChatMessage {
  username: string;
  color: string;
  message: string;
}

export interface Emote {
  id: string;
  url: string;
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

  public username: string;
  public color: string;
  public moderator: boolean;
  public subscriber: boolean;
  public emote_sets: string;
  public badges: string;
  
  public channel: string = '';
  public viewers: number = 0;

	public messages: ChatMessage[];

  constructor() { 
    this.messages = [];
  }

  private user_state(state: any) {
    this.username = state.username;
    this.color = state.color;
    this.badges = state.badges;
    this.moderator = state.moderator != '0';
    this.subscriber = state.subscriber != '0';
    this.emote_sets = state.emote_sets;

    console.log(`user state: ${state}`);
  }
  
  private room_state(state: any) {
    console.log(`room state: ${state}`);
  }

  private on_message(msg: any) {
    const message = {
      username: msg.username, 
      color: msg.color,
      message: msg.message,
    };
    console.log(this.messages, message);
    this.messages.push(message);
  }
  
  
  public init(name :string) {
    this.channel = name;
    IrcService.join(name, (msg: any) => {
      this.on_message(msg);
    }, (state: any) => {
      this.user_state(state);
    }, (state: any) => {
      this.room_state(state);
    });
  }

  public send(text) {

    const message = {
      username: this.username,
      color: this.color,
      message: text,
    }

    this.messages.push(message);

    IrcService.send_message(this.channel, text);
  }
  
  ngOnInit() {
  }

}
