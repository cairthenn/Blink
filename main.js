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

const { app, BrowserWindow, Menu, autoUpdater } = require('electron');
const settings = require('electron-settings');
const ChildProcess = require('child_process');
const path = require('path');
const fs = require('fs');

const updateServer = 'https://update.electronjs.org'
const feed = `${updateServer}/cairthenn/blink/${process.platform}-${process.arch}/${app.getVersion()}`

let window;
let firstRun = false;

if (handleSquirrelEvent()) {
    return;
}

function autoUpdate() {
    
    autoUpdater.setFeedURL(feed);
    
    autoUpdater.on('update-downloaded', () => {
        window.webContents.send('update-downloaded');
    });

    autoUpdater.on('error', err => {
        const errorLog = `${process.execPath}/error.log`;
        fs.appendFile(errorLog, `There was a problem updating the application: ${err}`, (err) => {

        });
    }) 

    autoUpdater.checkForUpdates();
    
    setInterval(() => { 
        autoUpdater.checkForUpdates();
    }, 600000);
}

app.on('ready', () => {    
    launchApplication();
});

function launchApplication() {

    const width = settings.get('width') || 520;
    const height = settings.get('height') || 800;
    const x = settings.get('x');
    const y = settings.get('y');

    window = new BrowserWindow( {
        minWidth: 340,
        x: x,
        y: y,
        width: width,
        height: height,
        show: false,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
        },
        icon: './dist/icon.ico',
    });

    window.on('close', () => {
        const size = window.getSize();
        const position = window.getPosition();
        settings.set('width', size[0]);
        settings.set('height', size[1]);
        settings.set('x', position[0]);
        settings.set('y', position[1]);
    });

    window.on('closed', () => {
        app.quit();
        window = null;
    });

    window.on('ready-to-show', () => {
        window.show();
    });

    if(process.env.NODE_ENV == 'dev') {
        window.webContents.toggleDevTools();
    }
    
    window.loadFile('./dist/index.html');

    if(!firstRun && process.env.NODE_ENV != 'dev' && process.platform == 'win32') {
        autoUpdate();
    }
}

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
      return false;
    }
  
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);
  
    const spawn = function(command, args) {
      let spawnedProcess, error;
  
      try {
        spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
      } catch (error) {}
  
      return spawnedProcess;
    };
  
    const spawnUpdate = function(args) {
      return spawn(updateDotExe, args);
    };
  
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-firstrun':
        firstRun = true;
        return false;
      case '--squirrel-install':
      case '--squirrel-updated':
        spawnUpdate(['--createShortcut', exeName]);
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-uninstall':
        spawnUpdate(['--removeShortcut', exeName]);
  
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-obsolete':  
        app.quit();
        return true;
    }
  };

const standardTemplate = [{
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
}];

// The first menu slot on Mac OS is reserved by the application
const macTemplate = [ { label : 'Dawrin Placeholder' } ].concat(standardTemplate);
const mainMenu = Menu.buildFromTemplate( process.platform == 'darwin' ? macTemplate : standardTemplate );
Menu.setApplicationMenu(mainMenu);