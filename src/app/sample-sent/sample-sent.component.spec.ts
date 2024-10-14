import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleSentComponent } from './sample-sent.component';

describe('SampleSentComponent', () => {
  let component: SampleSentComponent;
  let fixture: ComponentFixture<SampleSentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleSentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SampleSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
