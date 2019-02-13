import { Component, OnInit, Input, Output } from '@angular/core';

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
  public maxHistory: number = 200;

  private _highlight: string = "";
  private _blacklist: string = "";
  private _ignored: string = "";

  public highlightWords: string[] = [];
  public blacklistWords: string[] = [];
  public ignoredUsers: string[] = [];

  constructor() { }


  private commaDelimiter(words: string) {
    return words.split(',').map(s => s.trim()).filter(s => !/^\s*$/.test(s));
  }

  set highlight(words: string) {
    this._highlight = words;
    this.highlightWords = this.commaDelimiter(words);
    console.log(this.highlightWords);
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

  ngOnInit() {
  }

}
