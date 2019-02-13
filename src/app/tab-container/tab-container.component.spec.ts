import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabContainerComponent } from './tab-container.component';

describe('TabContainerComponent', () => {
    let component: TabContainerComponent;
    let fixture: ComponentFixture<TabContainerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ TabContainerComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TabContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
