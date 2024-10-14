import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ApiService } from '../../api.service';
import { CommonCategoryDTO } from '../CommonCategory.interface';
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
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-measurement-data',
  standalone: true,
  imports: [NzTableModule, ReactiveFormsModule, CommonModule, NzFormModule, NzButtonModule, NzModalModule, NzSelectModule],
  templateUrl: './measurement-data.component.html',
  styleUrls: ['./measurement-data.component.scss']
})
export class MeasurementDataComponent implements OnInit {
  @Output() totalSumChange = new EventEmitter<number>();
  columns: { id: string, name: string, unit: string, conversionPrice: number }[] = [];
  rows: CategoryParentChild[] = [];
  serialNumbers: { [key: string]: string } = {};
  idToName: { [key: string]: string } = {};
  measurementForm: FormGroup;
  isFormVisible = false;
  projects: any[] = [];
  categories: any[] = [];
  categoriesPC: any[] = [];
  matrix: { [rowId: string]: { [colId: string]: number } } = {};
  measurementId: string | null = null;

  constructor(private dataService: ApiService, private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.measurementForm = this.fb.group({
      measurements: this.fb.array([]),
      measurer: ['', Validators.required],
      measurementDate: ['', Validators.required],
      farmingProcess: ['', Validators.required],
      phonelandowner: ['', Validators.required],
      namelandowner: ['', Validators.required],
      projectId: ['', Validators.required]
    });
  }
  getTotalSum(): number {
    const total = this.calculateTotalSum(this.rows);
    this.totalSumChange.emit(total);
    return total;
  }

  private calculateTotalSum(rows: CategoryParentChild[]): number {
    return rows.reduce((totalSum, row) => {
      const rowTotal = this.getRowTotal(row.id);
      const childrenTotal = row.children && row.children.length > 0
        ? this.calculateTotalSum(row.children)
        : 0;
      return totalSum + rowTotal + childrenTotal;
    }, 0);
  }
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.measurementId = id;
        console.log('Retrieved id as measurementId:', this.measurementId);
      } else {
        this.route.paramMap.subscribe(params => {
          this.measurementId = params.get('id');
          console.log('Retrieved measurementId:', this.measurementId);
        });
        ;
      }

      if (this.measurementId) {
        this.fetchAndUpdateMatrix(this.measurementId);
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

  loadColumns(): Observable<{ id: string, name: string, unit: string }[]> {
    return this.dataService.getCategoriesByCategoryChat().pipe(
      tap(response => {
        this.columns = response.map(category => ({
          id: category.id,
          name: category.name,
          unit: category.unit,
          conversionPrice: category.conversionPrice
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

  getRowTotal(rowId: string): number {
    return this.columns.reduce((total, column) => {
      const value = this.getValue(rowId, column.id);
      return total + (value * column.conversionPrice);
    }, 0);
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
    this.measurements.push(this.fb.group({
      wasteSource: ['', Validators.required],
      gas: ['', Validators.required],
      data: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]]
    }));
  }

  removeMeasurement(index: number): void {
    this.measurements.removeAt(index);
  }

  toggleFormVisibility(): void {
    this.isFormVisible = !this.isFormVisible;
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
      const formData = this.measurementForm.value;
      this.dataService.addMeasurementData(formData).subscribe({
        next: (response) => {
          console.log('Success:', response);
        },
        error: (error) => {
          console.error('Error:', error);
        }
      });
    } else {
      console.error('Form is invalid');
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

