import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nfinals } from './nfinals';

describe('Nfinals', () => {
  let component: Nfinals;
  let fixture: ComponentFixture<Nfinals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nfinals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nfinals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
