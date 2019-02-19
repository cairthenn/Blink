import { Component, OnInit} from '@angular/core';
import { ElectronService } from '../electron.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    public lightTheme: boolean = false;
    public alternate: boolean = false;
    public separators: boolean = true;
    public flash: boolean = false;

    public timestamps: boolean = false;
    public charCount: boolean = true;
    public subs: boolean = true;
    public bits: boolean = true;
    public badges: boolean = true;

    public twitchEmotes: boolean = true;
    public bttv: boolean = true;
    public ffz: boolean = true;
    public gifs: boolean = false;

    public duplicates: boolean = false;
    public emotePriority: boolean = false;
    public anonymous: boolean = false;
    public alwaysScroll: boolean = false;
    public pauseOnHover: boolean = false;
    public maxHistory: number = 200;

    private _highlight: string = "";
    private _blacklist: string = "";
    private _ignored: string = "";

    public highlightWords: string[] = [];
    public blacklistWords: string[] = [];
    public ignoredUsers: string[] = [];

    constructor() { 
        this.load();
    }


    private commaDelimiter(words: string) {
        return words.split(',').map(s => s.trim()).filter(s => !/^\s*$/.test(s));
    }

    set highlight(words: string) {
        this._highlight = words;
        this.highlightWords = this.commaDelimiter(words);
    }
    
    get highlight() { return this._highlight; }

    set blacklist(words: string) {
        this._blacklist = words;
        this.blacklistWords = this.commaDelimiter(words);

    }

    get blacklist() { return this._blacklist; }

    set ignored(words: string) {
        this._ignored = words;
        this.ignoredUsers = this.commaDelimiter(words);
    }

    
    get ignored() { return this._ignored; }

    load() {
        const electronSettings = ElectronService.settings;

        this.lightTheme = electronSettings.get('lightTheme');
        this.alternate = electronSettings.alternate
        this.separators = electronSettings.get('separators');
        this.flash = electronSettings.get('flash');
        this.timestamps = electronSettings.get('timestamps');
        this.charCount = electronSettings.get('charCount');
        this.subs = electronSettings.get('subs');
        this.bits = electronSettings.get('bits');
        this.badges = electronSettings.get('badges');
        this.twitchEmotes = electronSettings.get('twitchEmotes');
        this.bttv = electronSettings.get('bttv');
        this.ffz = electronSettings.get('ffz');
        this.gifs = electronSettings.get('gifs');
        this.duplicates = electronSettings.get('duplicates');
        this.emotePriority = electronSettings.get('emotePriority');
        this.anonymous = electronSettings.get('anonymous');
        this.maxHistory = electronSettings.get('maxHistory');
        this.highlight = electronSettings.get('highlight');
        this.blacklist = electronSettings.get('blacklist');
        this.ignored = electronSettings.get('ignored');
    }

    save() {
        ElectronService.settings.setAll({
            lightTheme: this.lightTheme,
            alternate: this.alternate,
            separators: this.separators,
            flash: this.flash,
            timestamps: this.timestamps,
            charCount: this.charCount,
            subs: this.subs,
            bits: this.bits,
            badges: this.badges,
            twitchEmotes: this.twitchEmotes,
            bttv: this.bttv,
            ffz: this.ffz,
            gifs: this.gifs,
            duplicates: this.duplicates,
            emotePriority: this.emotePriority,
            anonymous: this.anonymous,
            maxHistory: this.maxHistory,
            highlight: this._highlight,
            blacklist: this._blacklist,
            ignored: this._ignored,
        });
    }

    ngOnInit() {
    }

}
