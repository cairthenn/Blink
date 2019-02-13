import { Component, OnInit } from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
    selector: 'app-tab-container',
    templateUrl: './tab-container.component.html',
    styleUrls: ['./tab-container.component.css']
})
export class TabContainerComponent implements OnInit {

    constructor() { }

    public tabs: TabComponent[];

    public select(tab : any) {

    }

    ngOnInit() {
    }

}
