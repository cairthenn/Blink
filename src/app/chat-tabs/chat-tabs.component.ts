import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { SettingsComponent } from '../settings/settings.component';

@Component({
    selector: 'app-chat-tabs',
    templateUrl: './chat-tabs.component.html',
    styleUrls: ['./chat-tabs.component.css']
})
export class ChatTabsComponent implements OnInit {

    @ViewChild(ChatComponent) active : ChatComponent;

    public chat_rooms : ChatComponent[];
    
    @Input() public settings : SettingsComponent;

    constructor() { }

    public add(name: string) {
        this.active.init(name);
    }

    ngOnInit() {
        this.chat_rooms = [];
    }

}
