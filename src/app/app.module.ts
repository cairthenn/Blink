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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessagesComponent } from './messages/messages.component';
import { SettingsComponent } from './settings/settings.component';
import { ChatComponent } from './chat/chat.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
import {    MatDialogModule,   MatInputModule,     MatSidenavModule,    MatFormFieldModule,
            MatMenuModule,     MatToolbarModule,   MatButtonModule,     MatIconModule,
            MatCheckboxModule, MatCardModule,      MatDividerModule,    MatBadgeModule,
            MatAutocompleteModule, MatOptionModule } from '@angular/material';
import { ViewerDialogComponent } from './viewer-dialog/viewer-dialog.component';
import { TitlebarComponent } from './titlebar/titlebar.component';

@NgModule({
    declarations: [
        AppComponent,
        MessagesComponent,
        ChatComponent,
        ChatInputComponent,
        SettingsComponent,
        ChannelDialogComponent,
        ViewerDialogComponent,
        TitlebarComponent,
    ],
    imports: [
        FormsModule,
        BrowserModule,
        AppRoutingModule,
        DragDropModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,

        // Material

        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatDialogModule,
        MatInputModule,
        MatMenuModule,
        MatToolbarModule,
        MatSidenavModule,
        MatCheckboxModule,
        MatCardModule,
        MatDividerModule,
        MatBadgeModule,
        MatAutocompleteModule,
        MatOptionModule,
    ],
    entryComponents: [
        ChannelDialogComponent,
        SettingsComponent,
        ViewerDialogComponent,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
