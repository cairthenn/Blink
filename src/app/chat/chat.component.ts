import { Component, OnInit, Input} from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { ChatService } from '../chat.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { ChannelDialogComponent } from '../channel-dialog/channel-dialog.component';
import { ElectronService } from '../electron.service';
import { IrcService } from '../irc.service';
import { AES } from 'crypto-js';
import { SettingsService } from '../settings.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit {

    private loaded: boolean = false;
    private token: string;

    @Input() 
    public settings : SettingsService;
    public tabWidth : number = 200;
    public contentWidth : number = 340;

    public tabs : ChatService[] = [];
    public username: string;
    public connected: boolean = false;
    public showSettings: boolean = false;
    public showTabs: boolean = false;
    public viewReady: boolean = false;
    

    constructor(private dialog: MatDialog) { }

    public saveChannels() {
       
        if(!this.loaded) {
            return;
        }

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
            this.addChannel(names[i]);
        }
        this.loaded = true;
    }

    public toggleSettings() {
        const ref = this.dialog.open(SettingsComponent, {
            data: this.settings,
            panelClass: "cc-dialog",
        });
        
        ref.afterClosed().subscribe(settings => {
            this.settings.save();
        });
    }

    public toggleTabs() {
        this.showTabs = !this.showTabs;
    }

    public select(tab : ChatService) {
        this.tabs.forEach(t => t.active = false);
        tab.active = true;
    }

    public remove(tab: ChatService) {
        for(var i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i] == tab) {
                this.tabs.splice(i, 1);
                tab.close();
                this.saveChannels();
                if(tab.active && this.tabs.length > 0) {
                    this.tabs[0].active = true;
                }
                return;
            }
        }
    }

    public rename(tab : ChatService) {
        const ref = this.dialog.open(ChannelDialogComponent, {
            panelClass: "cc-dialog",
        });

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

    public addChannel(name: string) {
        const find = this.tabs.find(x => x.channel === name.toLowerCase());
        if(find != undefined) {
            this.select(find);
            return;
        }

        this.createChannel(name);
    }

    public newTab() {
        const ref = this.dialog.open(ChannelDialogComponent, {
            panelClass: "cc-dialog",
        });
        
        ref.afterClosed().subscribe(channel => {
            if(channel == undefined || channel.length == 0) {
                return;
            }

            const find = this.tabs.find(x => x.channel === channel.toLowerCase());
            if(find != undefined) {
                this.select(find);
                return;
            }

            this.addChannel(channel);
        });
    }

    public dropped(event: CdkDragDrop<ChatService[]>) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

    ngAfterViewInit() {
        this.connected = false;
        IrcService.init((username, token) => {
            this.username = username;
            this.connected = true;
            this.token = AES.encrypt(token, username);
            this.loadChannels();
        }, (err) => {
            console.log(`Failed to connect to local server: ${err}`);
        });

    }

    ngOnInit() {

    }

}
