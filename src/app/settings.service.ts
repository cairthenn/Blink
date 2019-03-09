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
        this.drawer = settings.get('drawer');
        this.lightTheme = settings.get('lightTheme');
        this.alternate = settings.get('alternate');
        this.separators = settings.get('separators');
        this.flash = settings.get('flash');
        this.timestamps = settings.get('timestamps');
        this.modIcons = settings.get('modIcons');
        this.banIcon = settings.get('banIcon');
        this.purgeIcon = settings.get('purgeIcon');
        this.timeoutIcon = settings.get('timeoutIcon');
        this.deleteIcon = settings.get('deleteIcon');
        this.timeoutTime = settings.get('timeoutTime');
        this.subs = settings.get('subs');
        this.bits = settings.get('bits');
        this.badges = settings.get('badges');
        this.twitchEmotes = settings.get('twitchEmotes');
        this.bttvEmotes = settings.get('bttvEmotes');
        this.ffzEmotes = settings.get('ffzEmotes');
        this.duplicates = settings.get('duplicates');
        this.emotePriority = settings.get('emotePriority');
        this.anonymous = settings.get('anonymous');
        this.maxHistory = settings.get('maxHistory');
        this.highlightName = settings.get('highlightName');
        this.highlight = settings.get('highlight');
        this.blacklist = settings.get('blacklist');
        this.friends = settings.get('friends');
        this.ignored = settings.get('ignored');
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
