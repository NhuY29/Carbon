import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDenyComponent } from './project-deny.component';

describe('ProjectDenyComponent', () => {
  let component: ProjectDenyComponent;
  let fixture: ComponentFixture<ProjectDenyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDenyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDenyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
