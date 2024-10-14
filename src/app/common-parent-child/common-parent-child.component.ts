import { Category } from '../Category';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
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
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTagModule } from 'ng-zorro-antd/tag';


@Component({
  selector: 'app-common-parent-child',
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
    NzTreeViewModule,
    NzTreeModule,
    NzDrawerModule,
    NzTagModule
  ],
  templateUrl: './common-parent-child.component.html',
  styleUrls: ['./common-parent-child.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'hidden' })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ]
})
export class CommonParentChildComponent implements OnInit {
  categories: any[] = [];
  categoriesAll: any[] = [];
  treeNodes: NzTreeNodeOptions[] = [];
  categoryForm: FormGroup;
  isFormVisible = false;
  currentCategoryId: string | null = null;
  parentOptions: any[] = [];
  allOptions: any[] = [];
  showForm = false;
  isEditing = false;
  constructor(
    private fb: FormBuilder,
    private categoryService: ApiService,
    private message: NzMessageService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      parentId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadParentCategories();
  }

  loadParentCategories() {
    this.categoryService.getAllParentCategories().subscribe((data: any[]) => {
      this.parentOptions = data.map(category => ({
        value: category.id,
        label: category.name
      }));
      this.categories = data;
    });
  }

  loadAllCategories() {
    this.categoryService.getAllCategoriesParentChild().subscribe((data: any[]) => {
      this.allOptions = data.map(category => ({
        value: category.id,
        label: category.name,
        parentId: category.parentId
      }));
      this.categoriesAll = data;
    });
  }

  openCategoryForm() {
    this.isFormVisible = true;
    this.categoryForm.reset();
    this.currentCategoryId = null;
    this.loadAllCategories();
  }

  editCategory(category: any): void {
    this.categoryService.getCategoryById(category.id).subscribe(categoryDetails => {
      this.categoryForm.patchValue({
        name: categoryDetails.name,
        description: categoryDetails.description,
        parentId: categoryDetails.parentId ? categoryDetails.parentId : null
      });

      this.isFormVisible = true;
      this.currentCategoryId = category.id;
    }, error => {
      console.error('Lỗi khi lấy thông tin danh mục:', error);
      this.message.error('Lỗi khi lấy thông tin danh mục!');
    });
  }

  addChildCategory(parentId: string) {
    this.isFormVisible = true;
    this.currentCategoryId = null;
    this.categoryForm.reset();
    this.categoryForm.patchValue({ parentId });
    this.loadAllCategories();
  }

  onSubmit() {
    const categoryData = this.categoryForm.value;

    if (categoryData.parentId) {
      categoryData.parent = { id: categoryData.parentId };
    } else {
      categoryData.parent = null;
    }

    if (this.currentCategoryId) {
      this.categoryService.updateCategoryParentChild(this.currentCategoryId, categoryData)
        .subscribe(() => {
          this.message.success('Cập nhật danh mục thành công!');
          this.isFormVisible = false;
          this.showForm = false;
          this.loadParentCategories();
        }, error => {
          this.message.error('Cập nhật danh mục thất bại!');
          console.error('Lỗi khi cập nhật danh mục:', error);
        });
    } else {
      this.categoryService.createCategoryParentChild(categoryData)
        .subscribe(() => {
          this.message.success('Tạo danh mục thành công!');
          this.isFormVisible = false;
          this.showForm = false;
          this.loadParentCategories();
        }, error => {
          this.message.error('Tạo danh mục thất bại!');
          console.error('Lỗi khi tạo danh mục:', error);
        });
    }
  }

  findCategoryById(id: string) {
    const stack = [...this.categories];
    while (stack.length) {
      const category = stack.pop();
      if (category.id === id) {
        return category;
      }
      if (category.children) {
        stack.push(...category.children);
      }
    }
    return null;
  }

  deleteCategory(id: string) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      this.categoryService.deleteCategoryParentChild(id).subscribe(() => {
        this.loadParentCategories();
      });
    }
  }

  cancel() {
    this.isFormVisible = false;
    this.categoryForm.reset();
  }

  toggleChildCategories(category: any) {
    if (!category.showChildren) {
      this.fetchChildCategoriesRecursive(category);
    } else {
      category.showChildren = false;
    }
  }

  fetchChildCategoriesRecursive(category: any) {
    this.categoryService.getAllChildCategories(category.id).subscribe((children: any[]) => {
      category.children = children;
      category.showChildren = true;

      children.forEach((child: any) => {
        if (child.children && child.children.length > 0) {
          this.fetchChildCategoriesRecursive(child);
        }
      });
    }, error => {
      console.error('Error fetching child categories:', error);
      this.message.error('Error fetching child categories!');
    });
  }
}