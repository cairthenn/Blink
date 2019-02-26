import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../chat.service';
import { MatDialog, MatAutocomplete, MatOption, MatAutocompleteSelectedEvent } from '@angular/material';
import { FormControl} from '@angular/forms';
import { ViewerDialogComponent } from '../viewer-dialog/viewer-dialog.component';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

const dupChar = ' ⁭';

@Component({
    selector: 'app-chat-input',
    templateUrl: './chat-input.component.html',
})
export class ChatInputComponent implements OnInit {

    private messageControl = new FormControl();
    public acOptions: Observable<String[]>;
    public emoteAutocomplete: Observable<any[]>;
    private chatHistory = [];
    private tabbing: boolean = false;

    @ViewChild('auto') ac: MatAutocomplete;
    @ViewChild('messageBox') mb: ElementRef;
    @Input() public service: ChatService;
  
    constructor(private dialog: MatDialog) {
        this.acOptions = this.messageControl.valueChanges.pipe(
            debounceTime(100),
            map(value => this.filter(value))
        );
    }

    get users() {
        return this.service.combinedUserList;
    }

    private filter(value: string): any[] {

        if(!value || !value.length) {
            return;
        }

        const current = value.substring(0, this.mb.nativeElement.selectionStart);
        const wordStart = current.lastIndexOf(' ') + 1;
        const before = value.substring(0, wordStart);
        const after = value.substring(this.mb.nativeElement.selectionStart);

        const word = current.substr(wordStart);

        if(word && word.length) {
            if(word[0] == '@') {
                const name = word.substring(1);
                const results = this.users.filter(x => x.indexOf(name) === 0);
                return results.map(x => this.replacement(`@${x} `, before, after))
            } else if(word[0] == ':') {
                return [];
            }
        }

    }

    private replacement(word, before, after) {
        return {
            word: word,
            before: before,
            after: after,
        }
    }

    public openStream() {
        this.service.openStream();
    }

    public openViewers() {
        this.dialog.open(ViewerDialogComponent, {
            data: this.service.userList,
        })
    }

    public clearInput() {
        this.messageControl.setValue('');
    }
    
    public onSubmit() {
        this.send();
    }

    public send(event: KeyboardEvent = undefined) {
        
        if(event) {
            event.preventDefault();
        }

        if(this.ac.isOpen || !this.messageControl.value) {
            return;
        }

        var message = this.messageControl.value.substr(0, 500);
        
        if(!message || !message.length) {
            return;
        }
    
        var last = this.chatHistory.slice(-1)[0];
        if(message == last) {
            message += dupChar;
        } else {
            this.chatHistory.push(message);
            if(this.chatHistory.length > 25) {
                this.chatHistory.shift();
            }
        }

        this.clearInput();
        this.service.send(message);
    }

    ngAfterViewInit(): void {

    }
    
    ngOnInit(): void {
    
    }


}
