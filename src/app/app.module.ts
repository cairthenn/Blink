import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { TwitchApiComponent } from './twitch-api/twitch-api.component';
import { ChatComponent } from './chat/chat.component';
import { SettingsComponent } from './settings/settings.component';
import { ChatTabsComponent } from './chat-tabs/chat-tabs.component';

@NgModule({
  declarations: [
    AppComponent,
    TwitchApiComponent,
    ChatComponent,
    SettingsComponent,
    ChatTabsComponent,
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
