import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoscrollComponent } from './autoscroll.component';

describe('AutoscrollComponent', () => {
  let component: AutoscrollComponent;
  let fixture: ComponentFixture<AutoscrollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoscrollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoscrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
