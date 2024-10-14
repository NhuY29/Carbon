import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementDataListComponent } from './measurement-data-list.component';

describe('MeasurementDataListComponent', () => {
  let component: MeasurementDataListComponent;
  let fixture: ComponentFixture<MeasurementDataListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementDataListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasurementDataListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
