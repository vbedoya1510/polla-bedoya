import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NqualifiedTable } from './nqualified-table';

describe('NqualifiedTable', () => {
  let component: NqualifiedTable;
  let fixture: ComponentFixture<NqualifiedTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NqualifiedTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NqualifiedTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
