import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { SettingsService } from '../settings.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ChatService } from '../chat.service';

const themeLight = 'chat-light-theme';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
    public settings: SettingsService;

    get lightTheme() { return this.settings.lightTheme; }
    set lightTheme(val) { this.settings.lightTheme = val; this.setTheme(val); }
    get alternate() { return this.settings.alternate; }
    set alternate(val) { this.settings.alternate = val; this.data.updateView(); }
    get separators() { return this.settings.separators; }
    set separators(val) { this.settings.separators = val; this.data.updateView(); }
    get flash() { return this.settings.flash; }
    set flash(val) { this.settings.flash = val; }

    get timestamps() { return this.settings.timestamps; }
    set timestamps(val) { this.settings.timestamps = val; this.data.updateView(); }
    get subs() { return this.settings.subs; }
    set subs(val) { this.settings.subs = val; this.data.updateView(); }
    get bits() { return this.settings.bits; }
    set bits(val) { this.settings.bits = val; this.data.updateView(); }
    get badges() { return this.settings.badges; }
    set badges(val) { this.settings.badges = val; this.data.updateView(); }

    get twitchEmotes() { return this.settings.twitchEmotes; }
    set twitchEmotes(val) { this.settings.twitchEmotes = val; this.data.updateView(); }
    get bttvEmotes() { return this.settings.bttvEmotes; }
    set bttvEmotes(val) { this.settings.bttvEmotes = val; this.data.updateView(); }
    set ffzEmotes(val) { this.settings.ffzEmotes = val; this.data.updateView(); }
    get ffzEmotes() { return this.settings.ffzEmotes; }

    get duplicates() { return this.settings.duplicates; }
    set duplicates(val) { this.settings.duplicates = val; }
    get emotePriority() { return this.settings.emotePriority; }
    set emotePriority(val) { this.settings.emotePriority = val; }
    get anonymous() { return this.settings.anonymous; }
    set anonymous(val) { this.settings.anonymous = val; }
    get maxHistory() { return this.settings.maxHistory; }
    set maxHistory(val) { this.settings.maxHistory = Math.min(val, 300); }

    get friends() { return this.settings.friends; }
    set friends(val) { this.settings.friends = val; }

    get highlightName() { return this.settings.highlightName; }
    set highlightName(val) { this.settings.highlightName = val; }
    get highlight() { return this.settings.highlight; }
    set highlight(val) { this.settings.highlight = val; }
    get blacklist() { return this.settings.blacklist; }
    set blacklist(val) { this.settings.blacklist = val; }
    get ignored() { return this.settings.ignored; }
    set ignored(val) { this.settings.ignored = val; }


    constructor(public dialogRef: MatDialogRef<SettingsComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ChatService, public overlayContainer: OverlayContainer) {
        this.settings = data.settings;
    }

    setTheme(light: boolean) {
        if (light) {
            this.overlayContainer.getContainerElement().classList.add(themeLight);
        } else {
            this.overlayContainer.getContainerElement().classList.remove(themeLight);
        }
    }

    ngOnInit() {

    }

}
