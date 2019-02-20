import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';
import { SettingsComponent } from './settings/settings.component';
import { ChatTabsComponent } from './chat-tabs/chat-tabs.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { AutoscrollComponent } from './autoscroll/autoscroll.component';
import {    MatDialogModule,   MatInputModule,     MatSidenavModule,    MatFormFieldModule, 
            MatMenuModule,     MatToolbarModule,   MatButtonModule,     MatIconModule,
            MatCheckboxModule, } from '@angular/material';
@NgModule({
    declarations: [
        AppComponent,
        ChatComponent,
        ChatTabsComponent,
        ChatInputComponent,
        AutoscrollComponent,
        SettingsComponent,
        ChannelDialogComponent,
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
    ],
    entryComponents:[
        ChannelDialogComponent,
        SettingsComponent,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
