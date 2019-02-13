import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  public light_theme: boolean = false;
  public alternate: boolean = false;
  public separators: boolean = true;
  public flash: boolean = false;

  public timestamps: boolean = false;
  public char_count: boolean = true;
  public subs: boolean = true;
  public bits: boolean = true;
  public badges: boolean = true;

  public twitch_emotes: boolean = true;
  public bttv: boolean = true;
  public ffz: boolean = true;
  public gifs: boolean = false;

  public duplicates: boolean = false;
  public emote_priority: boolean = false;
  public anonymous: boolean = false;

  private _highlight: string = "";
  private _blacklist: string = "";
  private _ignored: string = "";

  public highlight_words: string[] = [];
  public blacklist_words: string[] = [];
  public ignored_users: string[] = [];

  constructor() { }


  private comma_delimiter(words: string) {
    return words.split(',').map(s => s.trim()).filter(s => !/^\s*$/.test(s));
  }

  set highlight(words: string) {
    this._highlight = words;
    this.highlight_words = this.comma_delimiter(words);
    console.log(this.highlight_words);
  }
  
  get highlight() { return this._highlight; }

  set blacklist(words: string) {
    this._blacklist = words;
    this.blacklist_words = this.comma_delimiter(words);

  }

  get blacklist() { return this._blacklist; }

  set ignored(words: string) {
    this._ignored = words;
    this.ignored_users = this.comma_delimiter(words);
  }

  get ignored() { return this._ignored; }

  ngOnInit() {
  }

}
