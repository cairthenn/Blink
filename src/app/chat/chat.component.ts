import { Component, OnInit, Input } from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { ChatService } from '../chat.service';


export class ChatMessage {
    isStatus: boolean = false;
    deleted: boolean = false;
    text: string = undefined;
    username: string = undefined;
    color: string = undefined;
    html: string = undefined;
    badges: string[] = [];
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

    @Input() public settings: SettingsComponent;
    @Input() public service: ChatService;

    constructor() {
    }

    get active() {
        return this.service.active;
    }

    get messages() {
        return this.service.messages;
    }
    
    ngOnInit() {

    }

}
