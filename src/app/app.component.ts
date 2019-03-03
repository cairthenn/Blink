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

import { Component } from '@angular/core';
import { SettingsService } from './settings.service';
import { OverlayContainer } from '@angular/cdk/overlay';

const themeLight = 'chat-light-theme';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
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

