import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarbonCreditDetailComponent } from './carbon-credit-detail.component';

describe('CarbonCreditDetailComponent', () => {
  let component: CarbonCreditDetailComponent;
  let fixture: ComponentFixture<CarbonCreditDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarbonCreditDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarbonCreditDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
