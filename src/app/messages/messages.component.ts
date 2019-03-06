/*
    Blink, a chat client for Twitch
    Copyright (C) 2019 cairthenn

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
    userId: string = undefined;
    mod = false;
    incoming = false;
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


    public ban(message) {
        message.banned = true;
        this.service.ban(message.username);
    }

    public unban(message) {
        message.banned = false;
        this.service.unban(message.username);
    }

    public timeout(message) {
        this.service.timeout(message.username, this.settings.timeoutTime);
    }

    public unTimeout(message) {
        message.timedOut = false;
        this.service.unTimeout(message.username);
    }

    public delete(message) {
        message.deleted = true;
        this.service.delete(message.id);
    }

    public purge(message) {
        this.service.purge(message.username);
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
        this.service.register(this);
        this.cdr.detach();
    }

    ngOnInit() {

    }
}
