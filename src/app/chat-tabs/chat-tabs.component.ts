import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { ChatService } from '../chat.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { ChannelDialogComponent } from '../channel-dialog/channel-dialog.component';

@Component({
    selector: 'app-chat-tabs',
    templateUrl: './chat-tabs.component.html',
    styleUrls: ['./chat-tabs.component.css']
})
export class ChatTabsComponent implements OnInit {

    public tabs : ChatService[] = [];
    
    @ViewChild(SettingsComponent) settings: SettingsComponent;
    @ViewChild('selectChannel') selectChannel: ElementRef;
    public showSettings: boolean = false;

    constructor(private dialog: MatDialog) { }

    public add(name: string) {
        const channel = new ChatService(this.settings);
        channel.init(name);
        this.tabs.forEach(t => t.active = false);
        channel.active = true;

        this.tabs.push(channel);
    }

    public select(tab : ChatService) {
        this.tabs.forEach(t => t.active = false);
        tab.active = true;
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

            tab.init(channel);
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

            this.add(channel);
        });
    }

    dropped(event: CdkDragDrop<ChatService[]>) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

    ngOnInit() {
        this.tabs = [];
    }

}
