import { Component, OnInit, Input, ViewChildren, Query, QueryList, ElementRef, HostListener } from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { ChatService } from '../chat.service';
import { SettingsService } from '../settings.service';


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

    private userActivity = false;
    private isLocked: boolean = false;
    private mutationObserver: MutationObserver;
    public wantsToScroll: boolean;

    constructor(private el: ElementRef) {
    }

    get active() {
        return this.service.active;
    }

    get messages() {
        return this.service.messages;
    }

    ngAfterViewInit(): void {
        this.mutationObserver = new MutationObserver(() => {
            if (this.isLocked || this.userActivity) {
                this.wantsToScroll = true;
                return
            }
            this.scrollToBottom();
        });

        this.mutationObserver.observe(this.el.nativeElement, {
            childList: true,
            subtree: true,
        });
    }
    
    ngOnInit() {

    }

    @HostListener('click') onClick() {
        this.userActivity = true;
    }

    @HostListener('mouseenter') onMouseEnter() {
        if(this.settings.stopScroll) {
            this.userActivity = true;
        }
    }

    @HostListener('mouseleave') onMouseLeave() {
        if(this.wantsToScroll && this.distance < 30) {
            this.scrollToBottom();
        }

        this.userActivity = false;
    }

    @HostListener("scroll")
    private scrollHandler(): void {
        this.isLocked = this.distance > 20;
        this.wantsToScroll = !this.isLocked && false || this.wantsToScroll;
    }

    get distance() {
        return this.el.nativeElement.scrollHeight - this.el.nativeElement.scrollTop - this.el.nativeElement.clientHeight;
    }

    public continueScrolling() {
        this.scrollToBottom();
        this.userActivity = false;
    }

    private scrollToBottom() {
        this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
        this.wantsToScroll = false;
    }

    public ngOnDestroy(): void {
        this.mutationObserver.disconnect();
    }

}
