import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleReceivedComponent } from './sample-received.component';

describe('SampleReceivedComponent', () => {
  let component: SampleReceivedComponent;
  let fixture: ComponentFixture<SampleReceivedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleReceivedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SampleReceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
