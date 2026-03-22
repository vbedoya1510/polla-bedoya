import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NphaseFinals } from './nphase-finals';

describe('NphaseFinals', () => {
  let component: NphaseFinals;
  let fixture: ComponentFixture<NphaseFinals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NphaseFinals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NphaseFinals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
