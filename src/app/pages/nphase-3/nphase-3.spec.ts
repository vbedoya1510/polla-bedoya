import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nphase3 } from './nphase-3';

describe('Nphase3', () => {
  let component: Nphase3;
  let fixture: ComponentFixture<Nphase3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nphase3]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nphase3);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
