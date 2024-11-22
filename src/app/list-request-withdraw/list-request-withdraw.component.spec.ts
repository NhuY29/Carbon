import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRequestWithdrawComponent } from './list-request-withdraw.component';

describe('ListRequestWithdrawComponent', () => {
  let component: ListRequestWithdrawComponent;
  let fixture: ComponentFixture<ListRequestWithdrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListRequestWithdrawComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListRequestWithdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
