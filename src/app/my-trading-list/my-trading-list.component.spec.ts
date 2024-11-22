import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTradingListComponent } from './my-trading-list.component';

describe('MyTradingListComponent', () => {
  let component: MyTradingListComponent;
  let fixture: ComponentFixture<MyTradingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTradingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTradingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
