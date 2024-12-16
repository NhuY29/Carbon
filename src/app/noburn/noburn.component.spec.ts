import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoburnComponent } from './noburn.component';

describe('NoburnComponent', () => {
  let component: NoburnComponent;
  let fixture: ComponentFixture<NoburnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoburnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoburnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
