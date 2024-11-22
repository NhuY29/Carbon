import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService, NzMessageModule } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { MapComponent } from '../map/map.component';
import { ApiService } from '../../api.service';
import { CommonCategoryDTO } from '../CommonCategory.interface';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { ProjectDTO } from '../ProjectDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageDTO } from '../ImageDTO';
import { CoordinateDTO } from '../CoordinateDTO';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzMessageModule,
    NzFormModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputModule,
    MapComponent,
    NzOptionComponent,
    CommonModule,
    NzListModule,
    NzUploadModule,
    AppTranslateModule
  ],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  projectForm: FormGroup;
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  categoriesType: CommonCategoryDTO[] = [];
  categoriesStandard: CommonCategoryDTO[] = [];
  selectedFiles: any[] = [];
  isUpdateMode: boolean = false;
  projectId: string | null = null;
  initialCoordinates: CoordinateDTO[] = [];
  destination: { lat: number, lng: number } | null = null;
  isViewMode: boolean = false;
  isWalletActive: boolean = true;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private projectService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService,
  ) {
    this.projectForm = this.fb.group({
      projectName: [null, [Validators.required]],
      projectDescription: [null, [Validators.required]],
      projectStatus: [null, [Validators.required]],
      projectStartDate: [null, [Validators.required]],
      projectEndDate: [null, [Validators.required]],
      projectCode: [null, [Validators.required]],
      type: [null, [Validators.required]],
      standard: [null, [Validators.required]],
      coordinates: this.fb.array([]),
      field: [null, [Validators.required]],
    }, { validator: this.dateRangeValidator });

    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');
    const savedState = localStorage.getItem('isWalletActive');
    this.isWalletActive = savedState === 'true'; 
    console.log(`Initial wallet state: ${this.isWalletActive ? 'ACTIVE' : 'INACTIVE'}`);
    if (this.isWalletActive) {
      this.translate.use('vi'); 
    } else {
      this.translate.use('en');
    } 
  }

  dateRangeValidator(group: FormGroup) {
    const startDate = group.get('projectStartDate')?.value;
    const endDate = group.get('projectEndDate')?.value;

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id');
      const mode = this.route.snapshot.queryParamMap.get('mode');
      this.isViewMode = mode === 'view';
      this.isUpdateMode = mode === 'edit';

      if (this.projectId) {
        this.loadProjectData(this.projectId);
      }
    });
    this.loadCategoriesType();
    this.loadCategoriesStandard();
  }

  loadProjectData(projectId: string): void {
    this.projectService.getProjectById(projectId).subscribe({
      next: (project: any) => {
        this.projectForm.patchValue(project);
        this.setCoordinates(project.coordinates);
        this.setImages(project.images);
        this.initialCoordinates = project.coordinates.map((coord: any) => ({
          ...coord,
          type: coord.type || undefined
        }));
        if (this.isViewMode) {
          this.projectForm.disable();
        }
      },
      error: (err) => {
        console.error('Error loading project data', err);
        this.message.error('Failed to load project data');
      }
    });
  }

  setCoordinates(coordinates: CoordinateDTO[]): void {
    const coordinatesFormArray = this.projectForm.get('coordinates') as FormArray;
    coordinatesFormArray.clear();
    coordinates.forEach(coordinate => {
      coordinatesFormArray.push(this.fb.group({
        lat: [coordinate.lat, Validators.required],
        lng: [coordinate.lng, Validators.required],
        radius: [coordinate.radius],
        order: [coordinate.order],
        type: [coordinate.type]
      }));
    });
  }

  setImages(images: ImageDTO[]): void {
    const baseUrl = 'http://localhost:8080/image/get-by-url?imageUrl=';
    this.selectedFiles = images.map((image, index) => {
      const imageUrl = `${baseUrl}${image.url}`;

      return {
        uid: `${index}`,
        name: image.imageId || `image${index + 1}.png`,
        status: 'done',
        url: imageUrl
      };
    });
  }

  onCoordinatesChanged(newCoordinates: CoordinateDTO[]): void {
    const coordinatesArray = this.projectForm.get('coordinates') as FormArray;
    coordinatesArray.clear();
    newCoordinates.forEach(coord => {
      coordinatesArray.push(this.fb.group({
        lat: [coord.lat],
        lng: [coord.lng],
        order: [coord.order],
        radius: [coord.radius],
        type: [coord.type]
      }));
    });
  }

  handleChange(info: any): void {
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      this.selectedFiles = info.fileList.map((file: any) => file.originFileObj || file);
    } else if (info.file.status === 'removed') {
      this.selectedFiles = this.selectedFiles.filter(f => f.uid !== info.file.uid);
    }
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      const coordinates = this.projectForm.get('coordinates')?.value || [];
      if (coordinates.length === 0) {
        this.message.error('Please add at least one coordinate.');
        return;
      }
      const formData = new FormData();
      formData.append('projectName', this.projectForm.get('projectName')?.value || '');
      formData.append('projectDescription', this.projectForm.get('projectDescription')?.value || '');
      formData.append('projectStatus', this.projectForm.get('projectStatus')?.value || '');
      formData.append('projectStartDate', this.projectForm.get('projectStartDate')?.value || '');
      formData.append('projectEndDate', this.projectForm.get('projectEndDate')?.value || '');
      formData.append('projectCode', this.projectForm.get('projectCode')?.value || '');
      formData.append('type', this.projectForm.get('type')?.value || '');
      formData.append('standard', this.projectForm.get('standard')?.value || '');
      formData.append('field', this.projectForm.get('field')?.value || '');

      const coordinatesJson = JSON.stringify(coordinates);
      formData.append('coordinates', coordinatesJson);

      if (this.selectedFiles.length > 0) {
        this.selectedFiles.forEach((file, index) => {
          formData.append('images', file.originFileObj || file);
        });
      } else {
        this.message.error('Please upload at least one image.');
        return;
      }

      if (this.isUpdateMode && this.projectId) {
        this.projectService.updateProject(this.projectId, formData).subscribe(
          response => {
            this.message.success('Project updated successfully!');
            this.router.navigate(['/projects']);
          },
          error => {
            this.message.error('Failed to update project.');
            console.error('Error:', error);
            window.location.reload();
          }
        );
      } else {
        this.projectService.createProject(formData).subscribe(
          response => {
            this.message.success('Project created successfully!');
            this.resetForm();
          },
          error => {
            this.message.error('Failed to create project.');
            console.error('Error:', error);
            window.location.reload();
          }
        );
      }
    } else {
      this.message.error('Please fill out the form correctly.');
    }
  }

  resetForm(): void {
    this.projectForm.reset();
    this.selectedFiles = [];
    if (this.mapComponent) {
      this.mapComponent.clearMap();
    }
  }

  loadCategoriesType(): void {
    this.projectService.getCategoriesByCategoryLoaiHinh().subscribe(
      (data: CommonCategoryDTO[]) => {
        this.categoriesType = data;
      },
      error => {
        this.message.error('Failed to load type categories.');
        console.error('Error:', error);
      }
    );
  }

  loadCategoriesStandard(): void {
    this.projectService.getCategoriesByCategoryTieuChuan().subscribe(
      (data: CommonCategoryDTO[]) => {
        this.categoriesStandard = data;
      },
      error => {
        this.message.error('Failed to load standard categories.');
        console.error('Error:', error);
      }
    );
  }
}