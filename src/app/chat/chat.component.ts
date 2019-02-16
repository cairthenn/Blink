import { Component, OnInit, Input, ElementRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
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
    @Input() public scrollbox: ElementRef;

    @ViewChild('messageArea') messageArea: ElementRef;
    @ViewChildren('message') messageList: QueryList<ElementRef>;

    constructor() {
    }

    // Scrolling
    public scrollHeight: number;
    public scrollTop: number;
    public wantsToScroll: boolean = false;
    
    private _mouseActive: boolean = false;
    set mouseActive(val : boolean) {
        this._mouseActive = val;
    }
    get mouseActive() {
        return this._mouseActive;
    }

    get active() {
        return this.service.active;
    }

    get messages() {
        return this.service.messages;
    }

    public tabcomplete(message: string, selectionStart: string, selectionEnd: string) {

        console.log(message, selectionStart, selectionEnd);
    }

    ngAfterViewInit() {

        this.messageList.changes.subscribe(x => {
            console.log(this.messageArea.nativeElement.scrollHeight, this.messageArea.nativeElement.scrollTop);
        });
    }
    
    ngOnInit() {

    }

}
