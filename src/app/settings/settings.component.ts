import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { SettingsService } from '../settings.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ChatService } from '../chat.service';

const themeLight = "chat-light-theme";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
    public settings: SettingsService;

    get lightTheme() { return this.settings.lightTheme; }
    get alternate() { return this.settings.alternate; }
    get separators() { return this.settings.separators; }
    get flash() { return this.settings.flash; }
  
    get timestamps() { return this.settings.timestamps; }
    get charCount() { return this.settings.charCount; }
    get subs() { return this.settings.subs; }
    get bits() { return this.settings.bits; }
    get badges() { return this.settings.badges; }
  
    get twitchEmotes() { return this.settings.twitchEmotes; }
    get bttvEmotes() { return this.settings.bttvEmotes; }
    get ffzEmotes() { return this.settings.ffzEmotes; }
  
    get duplicates() { return this.settings.duplicates; }
    get emotePriority() { return this.settings.emotePriority; }
    get anonymous() { return this.settings.anonymous; }
    get maxHistory() { return this.settings.maxHistory; }
    
    get highlightName() { return this.settings.highlightName; }
    get highlight() { return this.settings.highlight; }
    get blacklist() { return this.settings.blacklist; }
    get friends() { return this.settings.friends; }
    get ignored() { return this.settings.ignored; }

    set lightTheme(val) { this.settings.lightTheme = val; this.setTheme(val); }
    set alternate(val) { this.settings.alternate = val; this.data.updateView(); }
    set separators(val) { this.settings.separators = val; this.data.updateView(); }
    set flash(val) { this.settings.flash = val; }
  
    set timestamps(val) { this.settings.timestamps = val; this.data.updateView(); }
    set charCount(val) { this.settings.charCount = val; }
    set subs(val) { this.settings.subs = val; this.data.updateView(); }
    set bits(val) { this.settings.bits = val; this.data.updateView(); }
    set badges(val) { this.settings.badges = val; this.data.updateView(); }
  
    set twitchEmotes(val) { this.settings.twitchEmotes = val; this.data.updateView(); }
    set bttvEmotes(val) { this.settings.bttvEmotes = val; this.data.updateView(); }
    set ffzEmotes(val) { this.settings.ffzEmotes = val; this.data.updateView(); }
  
    set duplicates(val) { this.settings.duplicates = val; }
    set emotePriority(val) { this.settings.emotePriority = val; }
    set anonymous(val) { this.settings.anonymous = val; }
    set maxHistory(val) { this.settings.maxHistory = Math.min(val, 300); }
    
    set highlightName(val) { this.settings.highlightName = val; }
    set highlight(val) { this.settings.highlight = val; }
    set blacklist(val) { this.settings.blacklist = val; }
    set friends(val) { this.settings.friends = val; }
    set ignored(val) { this.settings.ignored = val; }

    constructor(public dialogRef: MatDialogRef<SettingsComponent>, 
        @Inject(MAT_DIALOG_DATA) public data: ChatService,
        public overlayContainer: OverlayContainer) { 
            this.settings = data.settings;
    }

    setTheme(light: boolean) {
        if(light) {
            this.overlayContainer.getContainerElement().classList.add(themeLight);
        } else {
            this.overlayContainer.getContainerElement().classList.remove(themeLight);
        }
    }

    ngOnInit() {

    }

}
