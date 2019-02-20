import { Component, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { SettingsService } from '../settings.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<SettingsComponent>, @Inject(MAT_DIALOG_DATA) public data: SettingsService) { 

    }

    ngOnInit() {
    }

}
