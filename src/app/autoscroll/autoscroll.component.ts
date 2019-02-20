import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-autoscroll',
  templateUrl: './autoscroll.component.html',
})
export class AutoscrollComponent implements OnInit {
    
    ngOnInit(): void {

    }

    @Input() settings: SettingsService;
        
    private userActivity = false;
    private isLocked: boolean = false;
    private mutationObserver: MutationObserver;
    public wantsToScroll: boolean;
    
    constructor(private el: ElementRef) { }

    @HostListener('click') onClick() {
        this.userActivity = true;
    }

    @HostListener('mouseenter') onMouseEnter() {
        if(this.settings.stopScroll) {
            this.userActivity = true;
        }
    }

    @HostListener('mouseleave') onMouseLeave() {
        if(this.wantsToScroll && this.distance < 30) {
            this.scrollToBottom();
        }

        this.userActivity = false;
    }

    @HostListener("scroll")
    private scrollHandler(): void {
        this.isLocked = this.distance > 20;
        this.wantsToScroll = !this.isLocked && false || this.wantsToScroll;
    }

    get distance() {
        return this.el.nativeElement.scrollHeight - this.el.nativeElement.scrollTop - this.el.nativeElement.clientHeight;
    }

    public continueScrolling() {
        this.scrollToBottom();
        this.userActivity = false;
    }

    private scrollToBottom() {
        this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
        this.wantsToScroll = false;
    }
    
    ngAfterContentInit(): void {
        
        this.mutationObserver = new MutationObserver(() => {
            if (this.isLocked || this.userActivity) {
                this.wantsToScroll = true;
                return
            }
            this.scrollToBottom();
        });

        this.mutationObserver.observe(this.el.nativeElement, {
            childList: true,
            subtree: true,
            attributes: true,
        });
    }

    public ngOnDestroy(): void {
        this.mutationObserver.disconnect();
    }
}
