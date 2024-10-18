import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GDViComponent } from './gdvi.component';

describe('GDViComponent', () => {
  let component: GDViComponent;
  let fixture: ComponentFixture<GDViComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GDViComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GDViComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
