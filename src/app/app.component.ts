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
    title = 'Blink';
    public settings: SettingsService;
    constructor(public overlayContainer: OverlayContainer) {
        this.settings = new SettingsService();
        if (this.settings.lightTheme) {
            this.overlayContainer.getContainerElement().classList.add(themeLight);
        }
    }
}

