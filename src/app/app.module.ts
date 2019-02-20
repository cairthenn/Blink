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
import { MatFormFieldModule, MatDialogModule, MatInputModule } from '@angular/material';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { AutoscrollComponent } from './autoscroll/autoscroll.component';

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
        MatFormFieldModule,
        MatDialogModule,
        MatInputModule,
        BrowserAnimationsModule,
    ],
    entryComponents:[
        ChannelDialogComponent,
        SettingsComponent,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
