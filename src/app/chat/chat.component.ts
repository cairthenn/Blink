import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { ChatService } from '../chat.service';


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

    @Input() public settings: SettingsComponent;
    @Input() public service: ChatService;
    @ViewChild('join-popup') selectChannel: ElementRef;

    get active() {
        return this.service.active;
    }

    constructor() {
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

    get messages() {
        return this.service.messages;
    }
    
    ngOnInit() {

    }

}
