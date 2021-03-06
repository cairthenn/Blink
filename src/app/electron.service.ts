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

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  static ipcRenderer = window.require('electron').ipcRenderer;
  static webFrame = window.require('electron').webFrame;
  static remote = window.require('electron').remote;
  static shell = window.require('electron').shell;
  static settings = window.require('electron').remote.require('electron-settings');
  static crypto = window.require('electron').remote.require('crypto');

  constructor() {

  }

  static isElectron = () => {
    return window && window.process && window.process.type;
  }
}
