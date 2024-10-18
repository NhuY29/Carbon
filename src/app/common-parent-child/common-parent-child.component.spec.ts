import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonParentChildComponent } from './common-parent-child.component';

describe('CommonParentChildComponent', () => {
  let component: CommonParentChildComponent;
  let fixture: ComponentFixture<CommonParentChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonParentChildComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonParentChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
