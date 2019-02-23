import { Component, OnInit, Input, ViewChildren, QueryList, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { ChatService } from '../chat.service';
import { SettingsService } from '../settings.service';
import { Subscription } from 'rxjs';


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
    selector: 'app-messages',
    templateUrl: './messages.component.html',
})
export class MessagesComponent implements OnInit {

    @Input() public settings: SettingsService;
    @Input() public service: ChatService;
    @ViewChildren('message') messageEls: QueryList<ElementRef>;

    private userActivity = false;
    private isLocked: boolean = false;
    public wantsToScroll: boolean;
    private _active: boolean;
    private subscription: Subscription;

    constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {
    }

    @Input() set active(val: boolean) {
        
        setTimeout(() => {
            if(val) {
                this.updateView();
            }
            this._active = val;
        }, 50);
    }

    get active() {
        return this._active;
    }

    get messages() {
        return this.service.messages;
    }

    ngAfterViewInit(): void {
        this.cdr.detach();
        this.service.onNewMessage = () => {
            if(this.active) {
                this.updateView();
            }
        };
    }
    
    ngOnInit() {

    }

    @HostListener('click') onClick() {
        this.userActivity = true;
    }

    @HostListener('mouseleave') onMouseLeave() {
        if(this.wantsToScroll && this.distance < 30) {
            this.scrollToBottom();
        }

        this.userActivity = false;
    }

    @HostListener("scroll")
    private scrollHandler(): void {
        this.isLocked = this.distance > 30;
        this.userActivity = false;
        if(!this.isLocked) {
            this.wantsToScroll = false;
        }
    }

    public updateView() {
        const scroll = !this.isLocked && !this.userActivity;
        this.cdr.detectChanges();
        if(scroll) {
            this.scrollToBottom();
        } else {
            this.wantsToScroll = true;
        }
    }

    get distance() {
        return this.el.nativeElement.scrollHeight - this.el.nativeElement.scrollTop - this.el.nativeElement.clientHeight;
    }

    public continueScrolling() {
        this.scrollToBottom();
    }

    private scrollToBottom() {
        this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
        this.wantsToScroll = false;
        this.userActivity = false;
    }
}
