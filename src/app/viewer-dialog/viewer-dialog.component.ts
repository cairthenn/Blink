import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-viewer-dialog',
  templateUrl: './viewer-dialog.component.html',
})
export class ViewerDialogComponent implements OnInit {

  public broadcaster: [] = [];
  public moderators: [] = [];
  public staff: [] = [];
  public vips: [] = [];
  public viewers: [] = [];

  public filter(val: string) {

    try {
      const regex = new RegExp(val);
      this.broadcaster = this.data.broadcaster.filter(x => regex.test(x));
      this.moderators = this.data.moderators.filter(x => regex.test(x));
      this.staff = this.data.staff.filter(x => regex.test(x));
      this.vips = this.data.vips.filter(x => regex.test(x));
      this.viewers = this.data.viewers.filter(x => regex.test(x));
    } catch(e) {
      console.log("Invalid RegEx passed to filter.");
    }
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { 
    this.broadcaster = data.broadcaster
    this.moderators = data.moderators;
    this.staff = data.staff;
    this.vips = data.vips;
    this.viewers = data.viewers;
  }

  ngOnInit() {
  }

}
