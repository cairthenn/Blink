import { Component, OnInit, Input } from '@angular/core';
import { ChatService } from '../chat.service';
import { MatDialog } from '@angular/material';
import { ViewerDialogComponent } from '../viewer-dialog/viewer-dialog.component';

@Component({
    selector: 'app-chat-input',
    templateUrl: './chat-input.component.html',
})
export class ChatInputComponent implements OnInit {

    @Input() public service: ChatService;
  
    constructor(private dialog: MatDialog) { }

    public tabcomplete(input: string, selectionStart: number, selectionEnd: number) {

    }

    public send(msg: string) {
        this.service.send(msg.substr(0, 500));
    }

    public openViewers() {
        this.dialog.open(ViewerDialogComponent, {
            data: this.service.userList,
        })
    }

    ngOnInit() {
        
    }

}
