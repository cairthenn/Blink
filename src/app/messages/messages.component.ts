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

import { Component, OnInit, Input, ElementRef, HostListener, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ChatService } from '../chat.service';
import { SettingsService } from '../settings.service';

export interface Info {
    title: string;
    picture: string;
    views: number;
}


@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
})
export class MessagesComponent implements OnInit, AfterViewInit, OnDestroy {

    private userActivity = false;
    private isLocked = false;
    public wantsToScroll = false;

    @Input() public settings: SettingsService;
    @Input() public service: ChatService;
    public userCard: any = {
        width: 325,
        top: 0,
        left: 0,
        opened: false,
        mod: false,
        data: undefined,
        banned: false,
        openTwitch: (user: string) => {
            this.service.openExternal(`https://www.twitch.tv/${user}`);
        },
        close: (event: MouseEvent) => {
            this.closeUserCard(event);
        },
        ban: (user: string) => {
            this.userCard.banned = true;
            this.service.ban(user);
        },
        unban: (user: string) => {
            this.userCard.banned = false;
            this.service.unban(user);
        },
        timeout: (user: string) => {
            this.service.timeout(user, this.settings.timeoutTime);
        },
        purge: (user: string) => {
            this.service.purge(user);
        },
    };

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

    public closeUserCard(event: MouseEvent) {
        event.stopPropagation();
        this.userCard.opened = false;
        this.update();
    }

    public openUserCard(name: string, event: MouseEvent) {
        event.stopPropagation();
        this.service.twitch.getChannel(name).then(channel => {
            const overhang = event.offsetX + this.userCard.width - this.el.nativeElement.clientWidth;
            this.userCard.left = overhang > 0 ? event.offsetX - overhang : event.offsetX;
            this.userCard.top = event.clientY - 75;
            this.userCard.opened = true;
            this.userCard.banned = false;
            this.userCard.mod = this.service.level > 0;
            this.userCard.data = channel;
            this.update();
        }).catch(err => {

        });
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

    ngOnDestroy() {
        this.service.unregister();
    }
}
