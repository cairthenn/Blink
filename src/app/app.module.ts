import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { TwitchApiComponent } from './twitch-api/twitch-api.component';
import { ChatComponent } from './chat/chat.component';
import { SettingsComponent } from './settings/settings.component';
import { ChatTabsComponent } from './chat-tabs/chat-tabs.component';
import { TabContainerComponent } from './tab-container/tab-container.component';
import { TabComponent } from './tab/tab.component';

@NgModule({
    declarations: [
        AppComponent,
        TwitchApiComponent,
        ChatComponent,
        SettingsComponent,
        ChatTabsComponent,
        TabContainerComponent,
        TabComponent,
    ],
    imports: [
        FormsModule,
        BrowserModule,
        AppRoutingModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
