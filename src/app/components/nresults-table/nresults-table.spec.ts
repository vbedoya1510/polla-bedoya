import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NresultsTable } from './nresults-table';

describe('NresultsTable', () => {
  let component: NresultsTable;
  let fixture: ComponentFixture<NresultsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NresultsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NresultsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
