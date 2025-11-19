import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsTable } from './groups-table';

describe('GroupsTable', () => {
  let component: GroupsTable;
  let fixture: ComponentFixture<GroupsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
