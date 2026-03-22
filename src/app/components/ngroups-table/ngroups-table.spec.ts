import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgroupsTable } from './ngroups-table';

describe('NgroupsTable', () => {
  let component: NgroupsTable;
  let fixture: ComponentFixture<NgroupsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgroupsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgroupsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
