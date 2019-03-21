import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-user-card',
    templateUrl: './user-card.component.html',
})
export class UserCardComponent implements OnInit {

@Input() public helper: any;

constructor() { }

    ngOnInit() {
    }
}
