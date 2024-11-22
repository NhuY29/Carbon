import { Category } from '../Category';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService, NzMessageModule } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { MapComponent } from '../map/map.component';
import { ApiService } from '../../api.service';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { CommonCategoryRequest } from '../CommonCategoryRequest';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
@Component({
  selector: 'app-common-category',
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
    NzTableModule,
    NzPaginationModule,
    NzModalModule,
    NzIconModule,
    NzButtonModule,
    FormsModule,
    AppTranslateModule
  ],
  templateUrl: './common-category.component.html',
  styleUrls: ['./common-category.component.scss']
})
export class CommonCategoryComponent implements OnInit {
  categoryForm: any;
  categories = Object.values(Category); 
  allCategories: CommonCategoryRequest[] = [];
  showForm = false; 
  isEditing = false;
  selectedCategory: CommonCategoryRequest | null = null; 
  filteredCategories: CommonCategoryRequest[] = [];
  searchTerm: string = ''; 
  category = ''; 
  isWalletActive: boolean = true;
  constructor( public translate: TranslateService,private fb: FormBuilder, private apiService: ApiService, private message: NzMessageService, private modal: NzModalService ) {
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
    this.categoryForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      category: [null, Validators.required],
      unit: [{ value: 'tấn', disabled: true }],
      conversionPrice: ['']
    });
    this.loadAllCategories();
  }
  searchCategories(): void {
    this.apiService.searchCategories(this.searchTerm, this.category).subscribe({
      next: (response) => {
        this.filteredCategories = response;
      },
      error: (error) => {
        console.error('Error searching categories', error);
        this.message.error('Error searching categories!');
      }
    });
  }
  loadAllCategories(): void {
    this.apiService.getAllCategories().subscribe({
      next: (response) => {
        this.allCategories = response;
        this.filteredCategories = this.allCategories;
      },
      error: (error) => {
        console.error('Error loading categories', error);
        this.message.error('Error loading categories!');
      }
    });
  }

  onCategoryChange(category: string): void {
    if (category === 'CHAT') {
      this.categoryForm.get('unit')?.setValidators([Validators.required]);
      this.categoryForm.get('conversionPrice')?.setValidators([Validators.required]);
    } else {
      this.categoryForm.get('unit')?.clearValidators();
      this.categoryForm.get('conversionPrice')?.clearValidators();
    }
    this.categoryForm.get('unit')?.updateValueAndValidity();
    this.categoryForm.get('conversionPrice')?.updateValueAndValidity();
  }

  isSubstancesCategory(): boolean {
    return this.categoryForm.get('category')?.value === 'CHAT';
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const categoryDTO = this.categoryForm.value;

      if (categoryDTO.category === 'LOAI_HINH' || categoryDTO.category === 'TIEU_CHUAN') {
        categoryDTO.unit = null; 
        categoryDTO.conversionPrice = null; 
      } else {
        categoryDTO.unit = 'tấn';
      }
  
      if (this.isEditing && this.selectedCategory) {
        this.apiService.updateCategory(this.selectedCategory.id, categoryDTO).subscribe({
          next: (response) => {
            console.log('Category updated successfully', response);
            this.message.success('Category updated successfully!');
            this.categoryForm.reset();
            this.showForm = false;
            this.isEditing = false;
            this.selectedCategory = null;
            this.loadAllCategories();
          },
          error: (error) => {
            console.error('Error updating category', error);
            this.message.error('Error updating category!');
          }
        });
      } else {
        this.apiService.createCategory(categoryDTO).subscribe({
          next: (response) => {
            console.log('Category created successfully', response);
            this.message.success('Category created successfully!');
            this.categoryForm.reset();
            this.showForm = false;
            this.loadAllCategories();
          },
          error: (error) => {
            console.error('Error creating category', error);
            this.message.error('Error creating category!');
          }
        });
      }
    } else {
      console.log('Form is invalid');
      this.message.warning('Please fill in all required fields.');
    }
  }
  


  deleteCategory(id: string): void {
    if (!id) {
      console.error('Category ID is null or undefined');
      this.message.error('Category ID is invalid!');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this category?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.apiService.deleteCategory(id).subscribe({
          next: () => {
            this.message.success('Category deleted successfully!');
            this.loadAllCategories();
          },
          error: (error) => {
            console.error('Error deleting category', error);
            this.message.error('Error deleting category!');
          }
        });
      }
    });
  }
  editCategory(category: CommonCategoryRequest): void {
    this.selectedCategory = category;
    this.isEditing = true;
    this.categoryForm.patchValue(category);
    this.showForm = true;
  }
}