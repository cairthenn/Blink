import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { MessagesComponent } from './messages/messages.component';
import { SettingsComponent } from './settings/settings.component';
import { ChatComponent } from './chat/chat.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
import {    MatDialogModule,   MatInputModule,     MatSidenavModule,    MatFormFieldModule, 
            MatMenuModule,     MatToolbarModule,   MatButtonModule,     MatIconModule,
            MatCheckboxModule, MatCardModule, MatDividerModule } from '@angular/material';
import { ViewerDialogComponent } from './viewer-dialog/viewer-dialog.component';

@NgModule({
    declarations: [
        AppComponent,
        MessagesComponent,
        ChatComponent,
        ChatInputComponent,
        SettingsComponent,
        ChannelDialogComponent,
        ViewerDialogComponent,
    ],
    imports: [
        FormsModule,
        BrowserModule,
        AppRoutingModule,
        DragDropModule,
        BrowserAnimationsModule,

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
    ],
    entryComponents:[
        ChannelDialogComponent,
        SettingsComponent,
        ViewerDialogComponent,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
