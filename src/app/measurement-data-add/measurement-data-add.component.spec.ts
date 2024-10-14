import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementDataAddComponent } from './measurement-data-add.component';

describe('MeasurementDataAddComponent', () => {
  let component: MeasurementDataAddComponent;
  let fixture: ComponentFixture<MeasurementDataAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementDataAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasurementDataAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
