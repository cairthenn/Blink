import { Component, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { SettingsService } from '../settings.service';
import { OverlayContainer } from '@angular/cdk/overlay';

const themeLight = "cc-root--light";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<SettingsComponent>, 
        @Inject(MAT_DIALOG_DATA) public data: SettingsService,
        public overlayContainer: OverlayContainer) { 
    }

    setTheme(light: boolean) {
        console.log(this.overlayContainer.getContainerElement(), light);
        if(light) {
            this.overlayContainer.getContainerElement().classList.add(themeLight);
        } else {
            this.overlayContainer.getContainerElement().classList.remove(themeLight);
        }
    }

    ngOnInit() {
    }

}
