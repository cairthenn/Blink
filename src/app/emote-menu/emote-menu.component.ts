import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-emote-menu',
  templateUrl: './emote-menu.component.html',
})
export class EmoteMenuComponent implements OnInit {

  @Input() public helper: any;  

  constructor() {

  }

  ngOnInit() {
  }

}
