import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

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
  public stopScroll: boolean = false;
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

  public load() {
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
    electronSettings.set('bttv', this.bttv);
    electronSettings.set('ffz', this.ffz);
    electronSettings.set('gifs', this.gifs);
    electronSettings.set('duplicates', this.duplicates);
    electronSettings.set('emotePriority', this.emotePriority);
    electronSettings.set('anonymous', this.anonymous);
    electronSettings.set('maxHistory', this.maxHistory);
    electronSettings.set('highlight', this.highlight);
    electronSettings.set('blacklist', this.blacklist);
    electronSettings.set('ignored', this.ignored);
}

}
