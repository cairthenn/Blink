import { Component, OnInit, ViewChild } from '@angular/core';
import { IrcService } from '../irc.service';
import { IpcRenderer } from 'electron';
import { ChatComponent } from '../chat/chat.component';
import { settings } from 'cluster';

@Component({
	selector: 'app-twitch-api',
	templateUrl: './twitch-api.component.html',
	styleUrls: ['./twitch-api.component.css']
})
export class TwitchApiComponent implements OnInit {

	
	public username: string;
	public show_settings: boolean = true;
	private ipcRenderer: IpcRenderer;

  	constructor() { 

	}

	@ViewChild(ChatComponent) chat: ChatComponent;

	connect() {
		
	}

	toggle_settings() {
		this.show_settings = !this.show_settings;
	}

	ngOnInit() {
		this.ipcRenderer = window.require('electron').ipcRenderer;		
		IrcService.init(username => {
			this.ipcRenderer.send('IRCReady');
			this.chat.init('vanityfox');
			this.username = username;
		}, () => {

		});
	}

}
