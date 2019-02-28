import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public lightTheme: boolean;
  public alternate: boolean;
  public separators: boolean;

  public timestamps: boolean;
  public charCount: boolean;
  public subs: boolean;
  public bits: boolean;
  public badges: boolean;

  public twitchEmotes: boolean;
  public bttvEmotes: boolean;
  public ffzEmotes: boolean;

  public duplicates: boolean;
  public emotePriority: boolean;
  public anonymous: boolean;
  public maxHistory: number;
  
  public highlightName: boolean;
  public flash: boolean;
  private _highlight: string;
  private _blacklist: string;
  private _friends: string;
  private _ignored: string;

  public highlightWords: string[];
  public blacklistWords: string[];
  public friendList: string[];
  public ignoredUsers: string[];

  constructor() {
    this.load();
  }

  private commaDelimiter(words: string) {

    if(!words || !words.length) {
      return [];
    }

    return words.split(',').map(s => s.trim().toLowerCase()).filter(s => !/^\s*$/.test(s));
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

  set friends(words: string) {
      this._friends = words;
      this.friendList = this.commaDelimiter(words);
  }

  get friends() { return this._friends; }

  set ignored(words: string) {
      this._ignored = words;
      this.ignoredUsers = this.commaDelimiter(words);
  }

  get ignored() { return this._ignored; }

  public load() {
      const electronSettings = ElectronService.settings;

      this.lightTheme = electronSettings.get('lightTheme') || false;
      this.alternate = electronSettings.get('alternate') || false;
      this.separators = electronSettings.get('separators') || false;
      this.flash = electronSettings.get('flash') || false;
      this.timestamps = electronSettings.get('timestamps') || false;
      this.charCount = electronSettings.get('charCount') || false;
      this.subs = electronSettings.get('subs') || true;
      this.bits = electronSettings.get('bits') || true;
      this.badges = electronSettings.get('badges') || true;
      this.twitchEmotes = electronSettings.get('twitchEmotes') || true;
      this.bttvEmotes = electronSettings.get('bttvEmotes') || true;
      this.ffzEmotes = electronSettings.get('ffzEmotes') || true;
      this.duplicates = electronSettings.get('duplicates') || false;
      this.emotePriority = electronSettings.get('emotePriority') || true;
      this.anonymous = electronSettings.get('anonymous') || false;
      this.maxHistory = electronSettings.get('maxHistory') || 300;
      this.highlightName = electronSettings.get('highlightName') || true;
      this.highlight = electronSettings.get('highlight') || '';
      this.blacklist = electronSettings.get('blacklist') || '';
      this.friends = electronSettings.get('friends') || '';
      this.ignored = electronSettings.get('ignored') || '';
  }

  save() {
    const electronSettings = ElectronService.settings;
    electronSettings.set('lightTheme', this.lightTheme);
    electronSettings.set('alternate', this.alternate);
    electronSettings.set('separators', this.separators);
    electronSettings.set('flash', this.flash);
    electronSettings.set('timestamps', this.timestamps);
    electronSettings.set('charCount', this.charCount);
    electronSettings.set('subs', this.subs);
    electronSettings.set('bits', this.bits);
    electronSettings.set('badges', this.badges);
    electronSettings.set('twitchEmotes', this.twitchEmotes);
    electronSettings.set('bttvEmotes', this.bttvEmotes);
    electronSettings.set('ffzEmotes', this.ffzEmotes);
    electronSettings.set('duplicates', this.duplicates);
    electronSettings.set('emotePriority', this.emotePriority);
    electronSettings.set('anonymous', this.anonymous);
    electronSettings.set('maxHistory', this.maxHistory);
    electronSettings.set('highlightName', this.highlightName);
    electronSettings.set('highlight', this.highlight);
    electronSettings.set('blacklist', this.blacklist);
    electronSettings.set('friends', this.friends);
    electronSettings.set('ignored', this.ignored);
}

}
