import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Finals } from './finals';

describe('Finals', () => {
  let component: Finals;
  let fixture: ComponentFixture<Finals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Finals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Finals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
