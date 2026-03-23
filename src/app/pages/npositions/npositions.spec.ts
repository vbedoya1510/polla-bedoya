import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Npositions } from './npositions';

describe('Npositions', () => {
  let component: Npositions;
  let fixture: ComponentFixture<Npositions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Npositions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Npositions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
