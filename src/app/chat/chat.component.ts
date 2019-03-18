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

import { Component, OnInit, Input, NgZone, HostListener } from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { ChatService } from '../chat.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { ChannelDialogComponent } from '../channel-dialog/channel-dialog.component';
import { IrcService } from '../irc.service';
import { AES } from 'crypto-js';
import { SettingsService } from '../settings.service';
import { ElectronService } from '../electron.service';
import { WebApiService } from '../web-api.service';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit {

    private loaded = false;
    private token: string;

    @Input()
    public settings: SettingsService;
    public tabWidth = 175;
    public contentWidth = 340;

    public tabs: ChatService[] = [];
    public username: string;
    public connected = false;
    public showSettings = false;
    public showTabs = false;
    public viewReady = false;
    public irc: IrcService;

    public account = {
        logout: () => { this.logout(); },
        switch: () => { this.login(true); }
    }

    constructor(public overlayContainer: OverlayContainer, private dialog: MatDialog, private zone: NgZone) {
    }

    @HostListener('window:beforeunload', ['$event'])
    private saveDrawer() {
        this.irc.disconnect();
        ElectronService.settings.set('drawer', this.settings.drawer);
    }

    public saveChannels() {

        if (!this.loaded) {
            return;
        }

        const names = this.tabs.map(x => x.channelDisplay);
        ElectronService.settings.set('channels', names);
    }

    public createChannel(name: string) {
        const channel = new ChatService(this.settings, this.irc);
        channel.init(name, this.username, this.token);
        this.tabs.forEach(t => t.active = false);
        channel.active = true;
        this.tabs.unshift(channel);
        this.saveChannels();
    }

    public loadChannels() {
        const names = ElectronService.settings.get('channels');
        if (names && names.length) {
            names.reverse().forEach((name) => {
                this.addChannel(name);
            });
        }
        const duration = name && names.length * 50 || 0;
        if (duration > 500) {
            setTimeout(() => this.loaded = true, duration);
        } else {
            this.loaded = true;
        }
    }

    public openSettings(tab: ChatService) {
        const ref = this.dialog.open(SettingsComponent, {
            data: this.settings,
        });

        ref.afterClosed().subscribe(settings => {
            this.settings.lightTheme = this.settings.lightThemeView;
            if (this.settings.lightTheme) {
                this.overlayContainer.getContainerElement().classList.add('chat-light-theme');
            } else {
                this.overlayContainer.getContainerElement().classList.remove('chat-light-theme');
            }
            this.settings.save();
            tab.updateView();
        });
    }

    public select(tab: ChatService) {
        this.tabs.forEach(t => t.active = false);
        tab.active = true;
    }

    public remove(tab: ChatService) {
        for (let i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i] === tab) {
                this.tabs.splice(i, 1);
                tab.close();
                this.saveChannels();
                if (tab.active && this.tabs.length > 0) {
                    const newIndex = Math.max(0, i - 1);
                    this.tabs[newIndex].active = true;
                }
                return;
            }
        }
    }

    public rename(tab: ChatService) {
        const ref = this.dialog.open(ChannelDialogComponent);

        ref.afterClosed().subscribe(channel => {
            if (!channel || !channel.length) {
                return;
            }

            const find = this.tabs.find(x => x.channel === channel.toLowerCase());
            if (find) {
                this.select(find);
                return;
            }

            tab.init(channel, this.username, this.token);
            this.saveChannels();
        });
    }

    public addChannel(name: string) {

        if (!name || !name.length) {
            return;
        }

        const find = this.tabs.find(x => x.channel === name.toLowerCase());
        if (find) {
            this.select(find);
            return;
        }
        this.zone.run(() => {
            this.createChannel(name);
        });
    }

    public newTab() {
        const ref = this.dialog.open(ChannelDialogComponent);

        ref.afterClosed().subscribe(channel => {
            if (!channel || !channel.length) {
                return;
            }

            const find = this.tabs.find(x => x.channel === channel.toLowerCase());
            if (find) {
                this.select(find);
                return;
            }

            this.addChannel(channel);
        });
    }

    public login(force: boolean = false) {
        ElectronService.ipcRenderer.send('try-login', force);
    }

    public logout() {
        this.connected = false;
        this.irc.disconnect();
    }

    public dropped(event: CdkDragDrop<ChatService[]>) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.saveChannels();
    }

    public handleLogin(username: string, token: string) {
        this.username = username;
        this.token = AES.encrypt(token, username);
        this.irc.connect(username, token).then(() => {
            this.zone.run(() => {
                if(this.loaded) {
                    this.tabs.forEach(c => c.init(c.channel, username, this.token));
                } else {
                    this.loadChannels();
                }
                this.connected = true;
            });
        });
    }

    ngOnInit() {
        this.irc = new IrcService(this.zone);
        ElectronService.ipcRenderer.on('login-success', (sender, username, token) => {
            this.handleLogin(username, token);
        });

        this.login(false);
    }

}
