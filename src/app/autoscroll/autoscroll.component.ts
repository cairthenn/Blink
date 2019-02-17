import { Component, OnInit, HostListener, ElementRef, QueryList, ContentChildren, Input } from '@angular/core';

@Component({
    selector: 'app-autoscroll',
    templateUrl: './autoscroll.component.html',
    styleUrls: ['./autoscroll.component.css']
})
export class AutoscrollComponent implements OnInit {

    @ContentChildren('message') messages : QueryList<ElementRef>;

    constructor(private el: ElementRef) { }

    private hovering: boolean = false;
    private missedHeight: number = 0;
    private wasNearEnd: boolean = false;
    public wantsToScroll: boolean = false;
    public _active: boolean = false;

    @HostListener('mouseenter') onMouseEnter() {
        this.hovering = true;
    }

    @HostListener('mouseleave') onMouseLEave() {
        this.hovering = false;
        if(this.wantsToScroll && this.missedHeight < 75) {
            this.scrollToBottom();
        }
    }

    get active() { return this._active; }

    @Input() set active(val: boolean) {

        if(!val) {
            const difference = this.el.nativeElement.scrollHeight - this.el.nativeElement.scrollTop;
        }

        this._active = val;
    }

    public newItem(changes: any) {

        if(!this.active && this.wasNearEnd) {
            
        }

        this.el.nativeElement.scrollTop += changes.last.nativeElement.scrollHeight;
        // if(!this.hovering) {
        //     this.scrollToBottom();
        // } else {
        //     this.wantsToScroll = true;
        //     this.missedHeight += changes.last.scrollHeight;
        // }
    }

    public scrollToBottom() {
        this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
        this.missedHeight = 0;
        this.wantsToScroll = false;
    }

    ngAfterContentInit(): void {

    }

    ngOnInit() {
    }

}