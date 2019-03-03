import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../electron.service';

@Component({
    selector: 'app-titlebar',
    templateUrl: './titlebar.component.html',
})
export class TitlebarComponent implements OnInit {

    public maximized = false;

    constructor() { 

    }

    

    public close() {
        ElectronService.remote.getCurrentWindow().close();
    }
    
    public minimize() {
        ElectronService.remote.getCurrentWindow().minimize();
    }

    public resize() {
        const window = ElectronService.remote.getCurrentWindow();
        if(this.maximized) {
            window.unmaximize();
        } else {
            window.maximize();
        }

        this.maximized = !this.maximized;
    }

    ngOnInit() {
    }

}
