import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfinalsTable } from './nfinals-table';

describe('NfinalsTable', () => {
  let component: NfinalsTable;
  let fixture: ComponentFixture<NfinalsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NfinalsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfinalsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
