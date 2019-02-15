import { Component, OnInit, Input, ElementRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
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

    @ViewChildren('message') messageList: QueryList<ElementRef>;
    @ViewChild('scrollBox') scrollBox: ElementRef;

    constructor() {
    }

    // Scrolling
    private _active: boolean = false;
    public scrollHeight: number;
    public scrollTop: number;
    public wantsToScroll: boolean = false;

    private userScrolled: boolean = false;

    public handleScroll(event: any) {
        if(this.active) {
            this.userScrolled = true;
        }
    }


    set active(val : boolean) {

        if(!val && this.wantsToScroll) {
            const difference = this.scrollBox.nativeElement.scrollHeight - (this.scrollBox.nativeElement.scrollTop + this.scrollBox.nativeElement.clientHeight);
            if(difference < 100) {
                this.scrollBox.nativeElement.scrollTop = this.scrollBox.nativeElement.scrollHeight;
                this.wantsToScroll = false;
            }
        }

        this._active = val;
    }

    get active() {
        return this._active;
    }

    get messages() {
        return this.service.messages;
    }

    public tabcomplete(message: string, selectionStart: string, selectionEnd: string) {

        console.log(message, selectionStart, selectionEnd);
    }

    ngAfterViewInit() {
        this.messageList.changes.subscribe(x => {

            // Mouse not in window
            if(!this.active)
            {
                const difference = this.scrollBox.nativeElement.scrollHeight - (this.scrollBox.nativeElement.scrollTop + this.scrollBox.nativeElement.clientHeight);
                
                console.log(difference, x.last.nativeElement.scrollHeight, this.scrollBox.nativeElement.clientHeight);
                // See if user scrolled themselves
                if(this.userScrolled && difference * 2 > this.scrollBox.nativeElement.clientHeight){
                    return;
                }
                this.userScrolled = false;
                this.wantsToScroll = false;    
                this.scrollBox.nativeElement.scrollTop = this.scrollBox.nativeElement.scrollHeight;

            } else {
                this.wantsToScroll = true;
            }

        });
    }
    
    ngOnInit() {

    }

}
