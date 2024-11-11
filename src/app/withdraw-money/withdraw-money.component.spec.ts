import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawMoneyComponent } from './withdraw-money.component';

describe('WithdrawMoneyComponent', () => {
  let component: WithdrawMoneyComponent;
  let fixture: ComponentFixture<WithdrawMoneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithdrawMoneyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WithdrawMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
