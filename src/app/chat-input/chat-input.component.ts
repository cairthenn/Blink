import { Component, OnInit, Input } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
    selector: 'app-chat-input',
    templateUrl: './chat-input.component.html',
})
export class ChatInputComponent implements OnInit {

    @Input() public service: ChatService;
  
    constructor() { }

    public tabcomplete(input: string, selectionStart: number, selectionEnd: number) {

    }

    public send(msg: string) {
        this.service.send(msg.substr(0, 500));
    }

    ngOnInit() {
        
    }

}
