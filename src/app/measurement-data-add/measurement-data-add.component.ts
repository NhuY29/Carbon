
import { Component, OnInit } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ApiService } from '../../api.service';
import { CategoryParentChild } from '../category-parent-child';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Observable, EMPTY, forkJoin } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService, NzMessageModule } from 'ng-zorro-antd/message';
import { MeasurementDataRequest } from '../MeasurementDataRequest';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
@Component({
  selector: 'app-measurement-data-add',
  standalone: true,
  imports: [AppTranslateModule,NzInputModule,NzTableModule,CommonModule,ReactiveFormsModule,NzFormModule,NzButtonModule,NzModalModule,NzSelectModule],
  templateUrl: './measurement-data-add.component.html',
  styleUrl: './measurement-data-add.component.scss'
})
export class MeasurementDataAddComponent {
  columns: { id: string, name: string }[] = [];
  rows: CategoryParentChild[] = [];
  serialNumbers: { [key: string]: string } = {};
  idToName: { [key: string]: string } = {}; 
  measurementForm: FormGroup;
  projects: any[] = [];
  categories: any[] = [];
  categoriesPC: any[] = [];
  matrix: { [rowId: string]: { [colId: string]: number } } = {};
  measurementId: string | null = null;
  isUpdateMode = false;
  isWalletActive: boolean = true;
  constructor( public translate: TranslateService,private dataService: ApiService, private fb: FormBuilder, private router: Router, private route: ActivatedRoute,private message: NzMessageService ) {
    this.measurementForm = this.fb.group({
      measurements: this.fb.array([]),
      measurer: ['', Validators.required],
      measurementDate: ['', Validators.required],
      farmingProcess: ['', Validators.required],
      phonelandowner: ['', Validators.required],
      namelandowner: ['', Validators.required],
      projectId: ['', Validators.required],
      
    });
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

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.measurementId = params.get('id');
      this.isUpdateMode = !!this.measurementId;

      if (this.isUpdateMode && this.measurementId) {
        this.dataService.getMeasurementDataById(this.measurementId).subscribe({
          next: (data: MeasurementDataRequest) => {
            this.measurementForm.patchValue(data);
            this.setMeasurements(data.measurements);
          },
          error: (error) => {
            console.error('Error fetching measurement data:', error);
          }
        });
      }
    });

    forkJoin({
      rows: this.loadRows(),
      columns: this.loadColumns()
    }).subscribe({
      next: () => {
        this.loadProjects();
        this.loadCategories();
        this.loadCategoriesParentChild();
        if (this.measurementId) {
          this.fetchAndUpdateMatrix(this.measurementId);
        }
      },
      error: (err) => console.error('Error initializing data', err)
    });
  }
  setMeasurements(measurements: any[]): void {
    const measurementArray = this.measurementForm.get('measurements') as FormArray;
    measurements.forEach(measurement => {
      measurementArray.push(this.fb.group({
        wasteSource: [measurement.wasteSource, Validators.required],
        gas: [measurement.gas, Validators.required],
        data: [measurement.data, [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]] // Cho phép giá trị âm
      }));
    });
  }
  
  loadRows(): Observable<any> {
    return this.dataService.getAllParentCategories().pipe(
      tap((response: CategoryParentChild[]) => {
        this.rows = response;
        this.rows.forEach((parent, index) => {
          this.serialNumbers[parent.id] = (index + 1).toString();
          this.fetchChildCategoriesRecursive(parent, this.serialNumbers[parent.id]);
          this.initializeMatrix();
        });
      }),
      catchError(err => {
        console.error('Error fetching rows', err);
        return EMPTY;
      })
    );
  }

  loadColumns(): Observable<{ id: string, name: string }[]> {
    return this.dataService.getCategoriesByCategoryChat().pipe(
      tap(response => {
        this.columns = response.map(category => ({
          id: category.id,
          name: category.name
        }));
        this.initializeMatrix();
      }),
      catchError(err => {
        console.error('Error fetching columns', err);
        return EMPTY;
      })
    );
  }

  initializeMatrix(): void {
    if (this.rows.length > 0 && this.columns.length > 0) {
      this.matrix = {};

      this.rows.forEach(row => {
        this.initializeRowAndChildren(row);
      });

      console.log('Matrix after initialization:', this.matrix);
    } else {
      console.log('Rows or Columns are empty');
    }
  }

  initializeRowAndChildren(row: CategoryParentChild): void {
    this.matrix[row.id] = {};
    this.columns.forEach(column => {
      this.matrix[row.id][column.id] = 0;
    });

    console.log(`Initialized Row ID: ${row.id} with columns:`, this.columns.map(col => col.id));

    if (row.children && row.children.length > 0) {
      row.children.forEach(child => {
        this.initializeRowAndChildren(child);
      });
    }
  }

  updateMatrixValue(rowId: string, colId: string, value: number): void {
    if (this.matrix[rowId] && this.matrix[rowId][colId] !== undefined) {
      this.matrix[rowId][colId] = value;
      console.log('Updated matrix:', this.matrix);
    } else {
      console.error('Invalid row ID or column ID');
    }
  }

  getValue(rowId: string, columnId: string): number {
    return this.matrix[rowId]?.[columnId] ?? 0;
  }

  fetchChildCategoriesRecursive(category: CategoryParentChild, parentSerial: string): void {
    this.dataService.getAllChildCategories(category.id).subscribe({
      next: (children: CategoryParentChild[]) => {
        category.children = children;
        children.forEach((child, index) => {
          const childSerial = `${parentSerial}.${index + 1}`;
          this.serialNumbers[child.id] = childSerial;
          this.idToName[child.id] = child.name;
          this.initializeMatrixForCategory(child);
          this.fetchChildCategoriesRecursive(child, childSerial);
        });
      },
      error: (err) => {
        console.error(`Error fetching child categories for parent ${category.id}`, err);
      }
    });
  }

  initializeMatrixForCategory(category: CategoryParentChild): void {
    if (this.columns.length > 0) {
      this.matrix[category.id] = {};

      this.columns.forEach(column => {
        this.matrix[category.id][column.id] = 0;
      });

      console.log(`Initialized matrix for category: ${category.id}`);
    }
  }

  get measurements() {
    return this.measurementForm.get('measurements') as FormArray;
  }

  addMeasurement(): void {
    const measurementArray = this.measurementForm.get('measurements') as FormArray;
    measurementArray.push(this.fb.group({
      wasteSource: ['', Validators.required],
      gas: ['', Validators.required],
      data: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]] // Cho phép giá trị âm
    }));
  }

  removeMeasurement(index: number): void {
    const measurementArray = this.measurementForm.get('measurements') as FormArray;
    measurementArray.removeAt(index);
  }
  loadProjects(): void {
    this.dataService.getProjects().subscribe({
      next: (response) => {
        console.log('Projects loaded:', response);
        this.projects = response;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.measurementForm.valid) {
      const formData: MeasurementDataRequest = this.measurementForm.value;
  
      if (this.isUpdateMode && this.measurementId) {
        this.dataService.updateMeasurementData(this.measurementId, formData).subscribe({
          next: (response) => {
            if (response.success) {
              this.message.create('success', response.message);
              this.resetForm();
              this.router.navigate(['/measurementDataList']);
            } else {
              console.error('Update failed:', response.message);
              this.message.create('error', response.message);
            }
          },
          error: (error) => {
            console.error('Update failed:', error);
            this.message.create('error', 'Cập nhật thất bại');
          }
        });
      } else {
        this.dataService.addMeasurementData(formData).subscribe({
          next: (response) => {
            console.log('Response from API:', response);
            if (response.success) {
              this.message.create('success', response.message);
              this.resetForm();
              this.router.navigate(['/measurementDataList']);
            } else {
              console.error('Add failed:', response.message);
              this.message.create('error', response.message);
            }
          },
          error: (error) => {
            console.error('Add failed:', error);
            this.message.create('error', 'Thêm thất bại');
          }
        });
      }
    } else {
      console.error('Form is invalid');
      this.message.create('error', 'Form is invalid');
    }
  }
  
  
  

  loadCategories(): void {
    this.dataService.getCategoriesByCategoryChat().subscribe({
      next: (response) => {
        console.log('Categories loaded:', response);
        this.categories = response;
        response.forEach(category => {
          this.idToName[category.id] = category.name;
        });
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }
  resetForm(): void {
    this.measurementForm.reset();
    const measurementArray = this.measurementForm.get('measurements') as FormArray;
    while (measurementArray.length) {
      measurementArray.removeAt(0);
    }
    this.addMeasurement();
  }
  loadCategoriesParentChild(): void {
    this.dataService.getAllCategoriesParentChild().subscribe({
      next: (response) => {
        console.log('Categories loaded:', response);
        this.categoriesPC = response;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  fetchAndUpdateMatrix(measurementId: string): void {
    this.dataService.getMeasurementData(measurementId).subscribe({
      next: (data) => {
        data.forEach(item => {
          this.updateMatrixValue(item.wasteSource, item.gas, item.data);
        });
      },
      error: (err) => {
        console.error('Error fetching measurement data', err);
      }
    });
  }
}
