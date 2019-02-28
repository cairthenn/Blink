import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../chat.service';
import { MatDialog, MatAutocomplete } from '@angular/material';
import { FormControl} from '@angular/forms';
import { ViewerDialogComponent } from '../viewer-dialog/viewer-dialog.component';
import { Observable } from 'rxjs';
import { map, debounceTime, take } from 'rxjs/operators';

const dupChar = ' ⁭';

@Component({
    selector: 'app-chat-input',
    templateUrl: './chat-input.component.html',
})
export class ChatInputComponent implements OnInit {
    
    public messageControl = new FormControl();
    public acOptions: Observable<String[]>;
    private chatHistory : string[] = [];

    private readonly maxInputHistory = 30;
    private historyIndex = -1;
    private duplicated : boolean = false;

    @ViewChild('messageBox') mb: ElementRef;
    @ViewChild('auto') ac: MatAutocomplete;
    @Input() public service: ChatService;

    public get text() { return this.mb.nativeElement.value; }
    public set text(val) { this.mb.nativeElement.value = val; }
    public get start() { return this.mb.nativeElement.selectionStart; }
    public get end() { return this.mb.nativeElement.selectionEnd; }
    public set start(val) { this.mb.nativeElement.selectionStart = val; }
    public set end(val) { this.mb.nativeElement.selectionEnd = val; }

  
    constructor(private dialog: MatDialog) {
        this.acOptions = this.messageControl.valueChanges.pipe(
            debounceTime(300),
            map(value => this.filter(value))
        );
    }

    get users() {
        return this.service.userList.autocomplete;
    }

    get emotes() {
        return this.service.emotes.autocomplete;
    }

    get emoteLookup() {
        return this.service.emotes.lookup;
    }


    private filter(value: string): any[] {

        if(!value || !value.length) {
            return;
        }

        const current = value.substring(0, this.start);
        const wordStart = current.lastIndexOf(' ') + 1;
        const before = value.substring(0, wordStart);
        const after = value.substring(this.start);

        const word = current.substr(wordStart);

        if(word && word.length > 1) {
            if(word[0] == '@') {
                const name = word.substring(1);
                const results = this.users.filter(x => x.indexOf(name) == 0);
                return results.slice(0, 10).map(x => this.replacement(`@${x} `, before, after))
            } else if(word[0] == ':') {
                const name = word.substring(1).toLowerCase();
                const results = this.emotes.filter(x => {
                    return x[0].indexOf(name) == 0;
                });
                return results.slice(0, 10).map(x => this.replacement(`${x[1]} `, before, after, this.emoteLookup[x[1]]));
            }
        }

    }

    private replacement(word: string, before: string, after: string, emote: any = undefined) {
        return {
            word: word,
            before: before,
            after: after,
            emote: emote,
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

    private tabs: any = {
        active: false,
        results: [],
        before: '',
        after: ''
    }

    public keydownHandler(event: KeyboardEvent) {

        if(event.key == 'Tab') {
            this.tabcomplete(event);
            return;
        } else if(event.key == 'ArrowUp' && !this.ac.isOpen
            && this.start == 0 && this.chatHistory.length) {
                this.historyIndex = (this.historyIndex + 1) % this.chatHistory.length;
                this.text = this.chatHistory[this.chatHistory.length - this.historyIndex - 1];
        } else if(event.key == 'ArrowDown' && !this.ac.isOpen
            && this.end == this.text.length && this.chatHistory.length) {
                this.historyIndex = (this.historyIndex - 1) < 0 ? Math.min(this.maxInputHistory, this.chatHistory.length) - 1 : this.historyIndex - 1;
                this.text = this.chatHistory[this.chatHistory.length - this.historyIndex - 1];
        } else if(event.key != 'Shift') {
            this.tabs.active = false;
        }
    }

    public tabcomplete(event: KeyboardEvent) {

        if(!this.text || !this.text.length) {
            return;
        }

        event.preventDefault();
        
        if(!this.tabs.active) {
            const current = this.text.substring(0, this.start);
            const wordStart = current.lastIndexOf(' ') + 1;
            this.tabs.before = this.text.substring(0, wordStart);
            this.tabs.after = this.text.substring(this.start);            
            const word = current.substr(wordStart).toLowerCase();

            if(!word || !word.length) {
                return;
            }

            const users = this.users.filter(x => x.indexOf(word) == 0);
            const emotes = this.emotes.filter(x => {
                return x[0].indexOf(word) == 0;
            }).map(x => x[1]);
            
            this.tabs.results = this.service.settings.emotePriority ? emotes.concat(users) : users.concat(emotes);

            if(!this.tabs.results.length) {
                return;
            }

            this.tabs.active = true;
        }

        let word;

        if(event.shiftKey) {
            word = this.tabs.results.pop();
            this.tabs.results.unshift(word);
        } else {
            word = this.tabs.results.shift();
            this.tabs.results.push(word);
        }
        
        this.text = `${this.tabs.before}${word} ${this.tabs.after}`;
        this.end = this.start = this.tabs.before.length + word.length + 1;
    }

    public send(event: KeyboardEvent = undefined) {
        
        if(event) {
            event.preventDefault();
        }

        if(this.ac.isOpen || !this.text) {
            return;
        }

        var message = this.text.substr(0, 500);
        
        if(!message || !message.length) {
            return;
        }
    
        var last = this.chatHistory.slice(-1)[0];

        if(message == last) {
            if(this.service.settings.duplicates && !this.duplicated) {
                message += dupChar;
            }
            this.duplicated = !this.duplicated;
        } else {
            this.chatHistory.push(message);
        }

        if(this.chatHistory.length > this.maxInputHistory) {
            this.chatHistory.shift();
        }

        this.clearInput();
        this.historyIndex = -1;
        this.service.send(message);
    }

    ngOnInit(): void {
    
    }


}
