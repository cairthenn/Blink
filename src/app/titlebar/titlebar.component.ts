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

import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../electron.service';

@Component({
    selector: 'app-titlebar',
    templateUrl: './titlebar.component.html',
})
export class TitlebarComponent implements OnInit {

    public update = false;
    public maximized = false;
    public version = ElectronService.remote.app.getVersion();

    constructor() {
        const window = ElectronService.remote.getCurrentWindow();
        window.on('maximize', () => this.maximized = true);
        window.on('unmaximize', () => this.maximized = false);
        ElectronService.ipcRenderer.on('update-downloaded', () => {
            this.update = true;
        });
    }

    public relaunch() {
        try {
            ElectronService.remote.autoUpdater.quitAndInstall();
        } catch (err) {
            console.log('Unable to quit and install update.');
        }
    }

    public close() {
        ElectronService.remote.getCurrentWindow().close();
    }

    public minimize() {
        ElectronService.remote.getCurrentWindow().minimize();
    }

    public maximize() {
        ElectronService.remote.getCurrentWindow().maximize();
    }
    public restore() {
        ElectronService.remote.getCurrentWindow().unmaximize();
    }

    ngOnInit() {
    }

}
