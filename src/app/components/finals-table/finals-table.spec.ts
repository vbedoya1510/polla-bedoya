import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalsTable } from './finals-table';

describe('FinalsTable', () => {
  let component: FinalsTable;
  let fixture: ComponentFixture<FinalsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
