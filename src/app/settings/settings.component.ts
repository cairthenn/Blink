import { Component, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { SettingsService } from '../settings.service';
import { OverlayContainer } from '@angular/cdk/overlay';

const themeLight = "chat-light-theme";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {

    get lightTheme () {
        return this.data.lightTheme;
    }

    set lightTheme(val: boolean) {
        this.data.lightTheme = val;
        this.setTheme(val);
    }

    constructor(public dialogRef: MatDialogRef<SettingsComponent>, 
        @Inject(MAT_DIALOG_DATA) public data: SettingsService,
        public overlayContainer: OverlayContainer) { 
    }



    setTheme(light: boolean) {
        if(light) {
            this.overlayContainer.getContainerElement().classList.add(themeLight);
        } else {
            this.overlayContainer.getContainerElement().classList.remove(themeLight);
        }
    }

    ngOnInit() {
    }

}
