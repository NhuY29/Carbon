import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormXNGDComponent } from './form-xngd.component';

describe('FormXNGDComponent', () => {
  let component: FormXNGDComponent;
  let fixture: ComponentFixture<FormXNGDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormXNGDComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormXNGDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
