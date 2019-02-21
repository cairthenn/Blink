import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-viewer-dialog',
  templateUrl: './viewer-dialog.component.html',
})
export class ViewerDialogComponent implements OnInit {

  private filter: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
