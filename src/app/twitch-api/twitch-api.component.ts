import { Component, OnInit } from '@angular/core';
import { ChatService} from '../chat.service';
import { IrcService } from '../irc.service';
import { IpcRenderer } from 'electron';

@Component({
	selector: 'app-twitch-api',
	templateUrl: './twitch-api.component.html',
	styleUrls: ['./twitch-api.component.css']
})
export class TwitchApiComponent implements OnInit {

	public chats : Array<ChatService> = [];
	public user : string;
	private ipcRenderer : IpcRenderer;
	public active_chat : ChatService;

  	constructor() { 

	}

	add_channel(name: string) {
		const chat = new ChatService();
		chat.init(name);
		this.chats.push(chat);
		this.active_chat = chat;
	}

	connect() {
		
	}

	ngOnInit() {
		this.ipcRenderer = window.require('electron').ipcRenderer;		
		IrcService.init(sucesss => {
			if(sucesss) {
				this.ipcRenderer.send('IRCReady');
				this.add_channel('autocair');
			}
		});
	}

}
