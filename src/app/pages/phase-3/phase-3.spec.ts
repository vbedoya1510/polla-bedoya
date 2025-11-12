import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Phase3 } from './phase-3';

describe('Phase3', () => {
  let component: Phase3;
  let fixture: ComponentFixture<Phase3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Phase3]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Phase3);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
