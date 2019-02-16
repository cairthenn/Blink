import { Component, OnInit, ViewChild, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { ChatService } from '../chat.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { ChannelDialogComponent } from '../channel-dialog/channel-dialog.component';
import { ElectronService } from '../electron.service';
import { IrcService } from '../irc.service';
import { AES } from 'crypto-js';

@Component({
    selector: 'app-chat-tabs',
    templateUrl: './chat-tabs.component.html',
    styleUrls: ['./chat-tabs.component.css']
})
export class ChatTabsComponent implements OnInit {

    @ViewChild(SettingsComponent) settings: SettingsComponent;

    public tabs : ChatService[] = [];
    public username: string;
    public connected: boolean = false;
    public showSettings: boolean = false;
    public viewReady: boolean = false;
    private token: string;
    

    constructor(private dialog: MatDialog, private ref: ChangeDetectorRef) { }

    public saveChannels() {
        const names = this.tabs.map(x => x.channelDisplay);
        ElectronService.settings.set('channels', names);
    }
    
    public createChannel(name: string) {
        const channel = new ChatService(this.settings);
        channel.init(name, this.username, this.token);
        this.tabs.forEach(t => t.active = false);
        channel.active = true;
        this.tabs.push(channel);
        this.saveChannels();
    }

    public loadChannels() {
        const names = ElectronService.settings.get('channels');
        for(var i in names) {
            this.createChannel(names[i]);
        }
    }

    public toggleSettings() {
        this.showSettings = !this.showSettings;
        this.settings.save();
        if(!this.showSettings) {
        }
    }

    public select(tab : ChatService) {
        this.tabs.forEach(t => t.active = false);
        tab.active = true;
    }

    public remove(tab: ChatService) {
        for(var i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i] == tab) {
                tab.close();
                this.tabs.splice(i, 1);
                this.saveChannels();
                return;
            }
        }
    }

    public rename(tab : ChatService) {
        const ref = this.dialog.open(ChannelDialogComponent);
        ref.afterClosed().subscribe(channel => {
            if(channel == undefined || channel.length == 0) {
                return;
            }

            const find = this.tabs.find(x => x.channel === channel.toLowerCase());
            if(find != undefined) {
                this.select(find);
                return;
            }

            tab.init(channel, this.username, this.token);
            this.saveChannels();
        });
    }

    public activeTabs() {
        return this.tabs.filter(x => x.active);
    }

    addChannel() {
        const ref = this.dialog.open(ChannelDialogComponent);
        ref.afterClosed().subscribe(channel => {
            if(channel == undefined || channel.length == 0) {
                return;
            }

            const find = this.tabs.find(x => x.channel === channel.toLowerCase());
            if(find != undefined) {
                this.select(find);
                return;
            }

            this.createChannel(channel);
        });
    }

    dropped(event: CdkDragDrop<ChatService[]>) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

    ngAfterViewInit() {
        this.connected = false;
        IrcService.init((username, token) => {
            this.username = username;
            this.connected = true;
            this.token = AES.encrypt(token, username);
            this.loadChannels();
            this.ref.detectChanges();
        }, (err) => {
            console.log(`Failed to connect to local server: ${err}`);
        });

    }

    ngOnInit() {

    }

}
