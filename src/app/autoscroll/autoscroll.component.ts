import { Component, OnInit, HostListener, ElementRef, QueryList, ContentChildren } from '@angular/core';

@Component({
    selector: 'app-autoscroll',
    templateUrl: './autoscroll.component.html',
    styleUrls: ['./autoscroll.component.css']
})
export class AutoscrollComponent implements OnInit {

    @ContentChildren('message') messages : QueryList<ElementRef>;

    constructor(private el: ElementRef) { }

    @HostListener('mouseenter') onMouseEnter() {

    }

    public newItem(changes: any) {
        this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
    }

    ngAfterContentInit(): void {

    }

    ngOnInit() {
    }

}
