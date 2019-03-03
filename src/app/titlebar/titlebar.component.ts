import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../electron.service';

@Component({
    selector: 'app-titlebar',
    templateUrl: './titlebar.component.html',
})
export class TitlebarComponent implements OnInit {

    public maximized = false;

    constructor() {
        const window = ElectronService.remote.getCurrentWindow();
        window.on('maximize', () => this.maximized = true);
        window.on('unmaximize', () => this.maximized = false);
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
