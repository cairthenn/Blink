import { Component, OnInit, ViewChild } from '@angular/core';
import { IrcService } from '../irc.service';
import { IpcRenderer } from 'electron';
import { SettingsComponent } from '../settings/settings.component';
import { ChatTabsComponent } from '../chat-tabs/chat-tabs.component';

@Component({
	selector: 'app-twitch-api',
	templateUrl: './twitch-api.component.html',
	styleUrls: ['./twitch-api.component.css']
})
export class TwitchApiComponent implements OnInit {

	
	public username: string;
	public connected: boolean = false;
	public show_settings: boolean = false;
	private ipcRenderer: IpcRenderer;

  	constructor() { 

	}

	@ViewChild(ChatTabsComponent) chat_tabs: ChatTabsComponent;
	@ViewChild(SettingsComponent) settings: SettingsComponent;

	connect() {
		
	}

	toggle_settings() {
		this.show_settings = !this.show_settings;
	}

	ngOnInit() {
		this.connected = false;
		this.ipcRenderer = window.require('electron').ipcRenderer;		
		IrcService.init(username => {
			this.ipcRenderer.send('IRCReady');
			this.chat_tabs.add('popesquidward');
			this.username = username;
			this.connected = true;
		}, () => {

		});
	}

}
