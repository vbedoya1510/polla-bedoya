import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NpositionsTable } from './npositions-table';

describe('NpositionsTable', () => {
  let component: NpositionsTable;
  let fixture: ComponentFixture<NpositionsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NpositionsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NpositionsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
