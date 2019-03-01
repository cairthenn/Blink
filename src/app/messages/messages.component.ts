import { Component, OnInit, Input, ElementRef, HostListener, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { SettingsService } from '../settings.service';


export class ChatMessage {
    isStatus = false;
    deleted = false;
    text: string = undefined;
    username: string = undefined;
    color: string = undefined;
    html: string = undefined;
    badges: string[] = [];
    id: string = undefined;
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
export class MessagesComponent implements OnInit, AfterViewInit {

    private userActivity = false;
    private isLocked = false;
    public wantsToScroll = false;

    @Input() public settings: SettingsService;
    @Input() public service: ChatService;

    @HostListener('click') onClick() {
        this.userActivity = true;
    }

    @HostListener('mouseleave') onMouseLeave() {
        if (this.wantsToScroll && this.distance < 50) {
            this.scrollToBottom();
        }

        this.userActivity = false;
    }

    @HostListener('scroll')
    private scrollHandler(): void {
        this.isLocked = this.distance > 50;
        this.userActivity = false;
        if (!this.isLocked) {
            this.wantsToScroll = false;
        }
    }

    constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {
    }

    get distance() {
        return this.el.nativeElement.scrollHeight - this.el.nativeElement.scrollTop - this.el.nativeElement.clientHeight;
    }

    get active() {
        return this.service.active;
    }

    get messages() {
        return this.service.messages;
    }

    public update() {
        this.cdr.detectChanges();
    }

    public updateAndScroll() {
        const scroll = !this.isLocked && !this.userActivity;
        this.update();
        if (scroll) {
            this.scrollToBottom();
        } else {
            this.wantsToScroll = true;
        }
    }

    public continueScrolling() {
        this.scrollToBottom();
    }

    private scrollToBottom() {
        this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
        this.wantsToScroll = false;
    }

    ngAfterViewInit(): void {
        this.cdr.detach();
        this.service.register(this);
    }

    ngOnInit() {

    }
}
