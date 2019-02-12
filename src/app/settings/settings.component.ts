import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @Input() public light_theme: boolean = false;
  @Input() public alternate: boolean = false;
  @Input() public separators: boolean = false;
  @Input() public flash: boolean = false;
  
  @Input() public timestamps: boolean = false;
  @Input() public char_count: boolean = true;
  @Input() public subs: boolean = true;
  @Input() public bits: boolean = true;

  @Input() public twitch_emotes: boolean = true;
  @Input() public bttv: boolean = true;
  @Input() public ffz: boolean = true;
  @Input() public gifs: boolean = false;

  @Input() public duplicates: boolean = false;
  @Input() public emote_priority: boolean = false;
  @Input() public anonymous: boolean = false;

  private _highlight: string = "";
  private _blacklist: string = "";
  private _ignored: string = "";

  public highlight_words: string[] = [];
  public blacklist_words: string[] = [];
  public ignored_users: string[] = [];

  constructor() { }


  private comma_delimiter(words: string) {
    return words.split(',').map(s => s.trim()).filter(s => { /^\s*$/.test(s) })
  }

  @Input() set highlight(words: string) {
    this._highlight = words;
    this.highlight_words = this.comma_delimiter(words);
    console.log(words);
  }
  
  get highlight() { return this._highlight; }

  @Input() set blacklist(words: string) {
    this._blacklist = words;
    this.blacklist_words = this.comma_delimiter(words);

  }

  get blacklist() { return this._blacklist; }

  @Input() set ignored(words: string) {
    this._ignored = words;
    this.ignored_users = this.comma_delimiter(words);
  }

  get ignored() { return this._ignored; }

  ngOnInit() {
  }

}
