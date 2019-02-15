import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, remote } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as settings from 'electron-settings';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  // static ipcRenderer: typeof ipcRenderer;
  // static webFrame: typeof webFrame;
  // static remote: typeof remote;
  // static childProcess: typeof childProcess;
  // static fs: typeof fs;
  // static path: typeof path;
  // static settings: typeof settings;
  

  static ipcRenderer = window.require('electron').ipcRenderer;
  static webFrame = window.require('electron').webFrame;
  static remote = window.require('electron').remote;

  static settings = window.require('electron').remote.require('electron-settings');

  static childProcess = window.require('child_process');
  static fs = window.require('fs');
  static path = window.require('path');

  constructor() { 
    // if(this.isElectron()) {

    // }
  }

  static isElectron = () => {
    return window && window.process && window.process.type;
  }
}