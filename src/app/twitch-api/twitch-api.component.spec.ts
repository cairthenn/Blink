import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitchApiComponent } from './twitch-api.component';

describe('TwitchApiComponent', () => {
  let component: TwitchApiComponent;
  let fixture: ComponentFixture<TwitchApiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwitchApiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitchApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
