/*
    Blink, a chat client for Twitch
    Copyright (C) 2019 cairthenn

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
  public error = false;

  public filter(val: string) {

    try {
      const regex = new RegExp(val);
      this.broadcaster = this.data.broadcaster.filter(x => regex.test(x));
      this.moderators = this.data.moderators.filter(x => regex.test(x));
      this.staff = this.data.staff.filter(x => regex.test(x));
      this.vips = this.data.vips.filter(x => regex.test(x));
      this.viewers = this.data.viewers.filter(x => regex.test(x));
      this.error = false;
    } catch (e) {
      this.error = true;
    }
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.broadcaster = data.broadcaster;
    this.moderators = data.moderators;
    this.staff = data.staff;
    this.vips = data.vips;
    this.viewers = data.viewers;
  }

  ngOnInit() {
  }

}
