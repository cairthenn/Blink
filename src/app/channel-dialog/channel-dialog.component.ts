import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-channel-dialog',
  templateUrl: './channel-dialog.component.html',
  styleUrls: ['./channel-dialog.component.css']
})
export class ChannelDialogComponent implements OnInit {

  public channel: string;

  constructor(public dialogRef: MatDialogRef<ChannelDialogComponent>) { }

  ngOnInit() {

  }

}
