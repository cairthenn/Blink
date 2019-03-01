import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, remote, shell } from 'electron-forge';
import * as settings from 'electron-settings';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  static ipcRenderer = window.require('electron').ipcRenderer;
  static webFrame = window.require('electron').webFrame;
  static remote = window.require('electron').remote;
  static shell = window.require('electron').shell;
  static settings = window.require('electron').remote.require('electron-settings');

  constructor() {

  }

  static isElectron = () => {
    return window && window.process && window.process.type;
  }
}
