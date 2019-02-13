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
	public showSettings: boolean = false;
	private ipcRenderer: IpcRenderer;

  	constructor() { 

	}

	@ViewChild(ChatTabsComponent) chatTabs: ChatTabsComponent;
	@ViewChild(SettingsComponent) settings: SettingsComponent;

	connect() {
		
	}

	toggleSettings() {
		this.showSettings = !this.showSettings;
	}

	ngOnInit() {
		this.connected = false;
		this.ipcRenderer = window.require('electron').ipcRenderer;		
		IrcService.init(username => {
			this.ipcRenderer.send('IRCReady');
			this.chatTabs.add('autocair');
			this.username = username;
			this.connected = true;
		}, () => {

		});
	}

}
