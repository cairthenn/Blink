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

import { ElectronService } from './electron.service';
export class SettingsService {

    public drawer = false;

    public lightTheme = false;
    public lightThemeView = false;
    public alternate = false;
    public separators = false;

    public timestamps = false;
    public modIcons = true;
    public banIcon = true;
    public purgeIcon = false;
    public timeoutIcon = true;
    public deleteIcon = true;
    public timeoutTime = 60;

    public subs = true;
    public bits = true;
    public badges = true;

    public twitchEmotes = true;
    public bttvEmotes = true;
    public ffzEmotes = true;

    public duplicates = false;
    public emotePriority = true;
    public anonymous = false;
    public maxHistory = 300;

    public highlightName = true;
    public flash = false;
    private highlightProxy = '';
    private blacklistProxy = '';
    private friendsProxy = '';
    private ignoredProxy = '';

    public highlightWords: string[] = [];
    public blacklistWords: string[] = [];
    public friendList: string[] = [];
    public ignoredUsers: string[] = [];

    constructor() {
        this.load();
    }

    private commaDelimiter(words: string) {

        if (!words || !words.length) {
        return [];
        }

        return words.split(',').map(s => s.trim().toLowerCase()).filter(s => !/^\s*$/.test(s));
    }

    set highlight(words: string) {
        this.highlightProxy = words;
        this.highlightWords = this.commaDelimiter(words);
    }

    get highlight() { return this.highlightProxy; }

    set blacklist(words: string) {
        this.blacklistProxy = words;
        this.blacklistWords = this.commaDelimiter(words);

    }

    get blacklist() { return this.blacklistProxy; }

    set friends(words: string) {
        this.friendsProxy = words;
        this.friendList = this.commaDelimiter(words);
    }

    get friends() { return this.friendsProxy; }

    set ignored(words: string) {
        this.ignoredProxy = words;
        this.ignoredUsers = this.commaDelimiter(words);
    }

    get ignored() { return this.ignoredProxy; }

    public load() {
        const settings = ElectronService.settings;
        if(settings.has('drawer')) { this.drawer = settings.get('drawer'); }
        if(settings.has('lightTheme')) { this.lightTheme = settings.get('lightTheme'); }
        this.lightThemeView = this.lightTheme;
        if(settings.has('alternate')) { this.alternate = settings.get('alternate'); }
        if(settings.has('separators')) { this.separators = settings.get('separators'); }
        if(settings.has('flash')) { this.flash = settings.get('flash'); }
        if(settings.has('timestamps')) { this.timestamps = settings.get('timestamps'); }
        if(settings.has('modIcons')) { this.modIcons = settings.get('modIcons'); }
        if(settings.has('banIcon')) { this.banIcon = settings.get('banIcon'); }
        if(settings.has('purgeIcon')) { this.purgeIcon = settings.get('purgeIcon'); }
        if(settings.has('timeoutIcon')) { this.timeoutIcon = settings.get('timeoutIcon'); }
        if(settings.has('deleteIcon')) { this.deleteIcon = settings.get('deleteIcon'); }
        if(settings.has('timeoutTime')) { this.timeoutTime = settings.get('timeoutTime'); }
        if(settings.has('subs')) { this.subs = settings.get('subs'); }
        if(settings.has('bits')) { this.bits = settings.get('bits'); }
        if(settings.has('badges')) { this.badges = settings.get('badges'); }
        if(settings.has('twitchEmotes')) { this.twitchEmotes = settings.get('twitchEmotes'); }
        if(settings.has('bttvEmotes')) { this.bttvEmotes = settings.get('bttvEmotes'); }
        if(settings.has('ffzEmotes')) { this.ffzEmotes = settings.get('ffzEmotes'); }
        if(settings.has('duplicates')) { this.duplicates = settings.get('duplicates'); }
        if(settings.has('emotePriority')) { this.emotePriority = settings.get('emotePriority'); }
        if(settings.has('anonymous')) { this.anonymous = settings.get('anonymous'); }
        if(settings.has('maxHistory')) { this.maxHistory = settings.get('maxHistory'); }
        if(settings.has('highlightName')) { this.highlightName = settings.get('highlightName'); }
        if(settings.has('highlight')) { this.highlight = settings.get('highlight'); }
        if(settings.has('blacklist')) { this.blacklist = settings.get('blacklist'); }
        if(settings.has('friends')) { this.friends = settings.get('friends'); }
        if(settings.has('ignored')) { this.ignored = settings.get('ignored'); }
    }

    save() {
        const settings = ElectronService.settings;
        settings.set('lightTheme', this.lightTheme);
        settings.set('alternate', this.alternate);
        settings.set('separators', this.separators);
        settings.set('flash', this.flash);
        settings.set('timestamps', this.timestamps);
        settings.set('modIcons', this.modIcons);
        settings.set('banIcon', this.banIcon);
        settings.set('purgeIcon', this.purgeIcon);
        settings.set('timeoutIcon', this.timeoutIcon);
        settings.set('deleteIcon', this.deleteIcon);
        settings.set('timeoutTime', this.timeoutTime);
        settings.set('subs', this.subs);
        settings.set('bits', this.bits);
        settings.set('badges', this.badges);
        settings.set('twitchEmotes', this.twitchEmotes);
        settings.set('bttvEmotes', this.bttvEmotes);
        settings.set('ffzEmotes', this.ffzEmotes);
        settings.set('duplicates', this.duplicates);
        settings.set('emotePriority', this.emotePriority);
        settings.set('anonymous', this.anonymous);
        settings.set('maxHistory', this.maxHistory);
        settings.set('highlightName', this.highlightName);
        settings.set('highlight', this.highlight);
        settings.set('blacklist', this.blacklist);
        settings.set('friends', this.friends);
        settings.set('ignored', this.ignored);
    }

}
