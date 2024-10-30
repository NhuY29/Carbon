import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarbonCreditListComponent } from './carbon-credit-list.component';

describe('CarbonCreditListComponent', () => {
  let component: CarbonCreditListComponent;
  let fixture: ComponentFixture<CarbonCreditListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarbonCreditListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarbonCreditListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
