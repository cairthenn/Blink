import { Component, OnInit, ViewChild } from '@angular/core';
import { IrcService } from '../irc.service';
import { ChatTabsComponent } from '../chat-tabs/chat-tabs.component';

@Component({
    selector: 'app-twitch-api',
    templateUrl: './twitch-api.component.html',
    styleUrls: ['./twitch-api.component.css']
})
export class TwitchApiComponent implements OnInit {

    
    public username: string;
    public connected: boolean = false;

    constructor() { 

    }

    @ViewChild(ChatTabsComponent) chatTabs: ChatTabsComponent;

    connect() {
        
    }

    ngOnInit() {
        this.connected = false;     
        IrcService.init((username, token) => {
            this.username = username;
            this.connected = true;
        }, () => {

        });
    }

}
