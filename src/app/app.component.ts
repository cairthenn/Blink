import { Component } from '@angular/core';
import { SettingsService } from './settings.service';
import { OverlayContainer } from '@angular/cdk/overlay';

const themeLight = 'chat-light-theme';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'CChat';

    constructor(public settings : SettingsService, public overlayContainer: OverlayContainer) {
        if(settings.lightTheme) {
            this.overlayContainer.getContainerElement().classList.add(themeLight);
        }
    }
}

