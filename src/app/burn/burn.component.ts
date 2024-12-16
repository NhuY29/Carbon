import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ProjectOfTrade2 } from '../my-trading-list/ProjectOfTrade2';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ChangeDetectorRef } from '@angular/core';
export interface ImageDTO {
  imageId: string;
  url: string;
}

export interface ProjectDTO {
  projectId: string;
  projectName: string;
  projectDescription: string;
  field: string;
  projectStatus: string;
  projectStartDate: string;
  projectEndDate: string;
  projectCode: string;
  images: ImageDTO[];
  quantityBurn: number;
}

@Component({
  selector: 'app-burn',
  standalone: true,
  imports: [
    NzInputModule,
    NzFormModule,
    ReactiveFormsModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    FormsModule,
    AppTranslateModule,
    NzTableModule,
    CommonModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './burn.component.html',
  styleUrls: ['./burn.component.scss']
})
export class BurnComponent implements OnInit {
  projectForm: FormGroup;
  projectFormArray: FormArray;
  projectOptions: ProjectOfTrade2[] = [];
  projects2: ProjectDTO[] = [];
  imageUrls: { [key: string]: string[] } = {};
  isWalletActive: boolean = true;
  isModalVisible = false;
  selectedOption: string | undefined;
  quantity: number | undefined = 1;
  secretKey: string = '';
  selectedProject: any;
  
  transactions: Array<{
    transactionSignature: string;
    timestamp: string;
    blockNumber: number;
    ageInDays: number;
  }> = [];
  
  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    private projectService: ApiService,
    private message: NzMessageService,
    private router: Router,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,

  ) {
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

    this.projectForm = this.fb.group({
      selectedOption: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(1), Validators.max(1000)]],
      projects: this.fb.array([])
    });

    this.projectFormArray = this.projectForm.get('projects') as FormArray;
  }

  ngOnInit(): void {
    this.loadUserProjects();
    this.loadProjects();
    this.getWalletSecret();
    this.projectForm.valueChanges.subscribe(() => {
      this.onFormChange();
    });
  }
  closeHistoryModal(): void {
    this.isHistoryVisible = false; 
  }
  openHistoryModal(): void {
    this.isHistoryVisible = true;
  }
  isHistoryVisible: boolean = false;
  history(projectId: string): void {
    this.projectService.getTransactionsByProjectId(projectId).subscribe({
      next: (response: string) => {
        try {
          const transactions = response
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
              const transaction = JSON.parse(line);
              const timestamp = new Date(transaction.timestamp);
              const currentDate = new Date();
              const ageInDays = Math.floor(
                (currentDate.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24)
              );
              return {
                transactionSignature: transaction.transactionSignature,
                timestamp: transaction.timestamp,
                blockNumber: transaction.blockNumber,
                ageInDays,
              };
            });
  
          this.transactions = transactions;
          console.log("Transactions:", this.transactions); 
          this.isHistoryVisible = true;
          this.cdr.detectChanges(); 
        } catch (error) {
          console.error('Error parsing response:', error);
          this.message.error('Failed to parse transaction history');
        }
      },
      error: (error) => {
        console.error('Error fetching transaction history', error);
        this.message.error('Failed to fetch transaction history');
      },
    });
  }
  
  
  onFormChange(): void {
    const selectedProjects = this.projectFormArray.controls.map((control) => ({
      project: control.get('selectedOption')?.value,
      quantity: control.get('quantity')?.value,
    }));
  
    const { quantityBurn } = this.selectedProject;
    console.log("QB", quantityBurn);
    const amounts = selectedProjects.map((project) => {
      const validQuantity = project.quantity && project.quantity > 0 ? project.quantity : 0;
      return validQuantity;
    });
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    console.log('Tổng số lượng đã thực hiện:', totalAmount);
    if (quantityBurn + totalAmount > 0) {
      this.message.warning('Bạn đã chọn nhiều hơn yêu cầu ' + (quantityBurn + totalAmount));
    }
  }
  
  getWalletSecret(): void {
    this.projectService.getWalletSecret().subscribe(
      (response) => {
        this.secretKey = response;
      },
      (error) => {
        console.error('Lỗi khi lấy secretKey:', error);
      }
    );
  }
  openModal(project: any): void {
    this.selectedProject = project;
    console.log('selectedProject:', this.selectedProject);
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }
  onOk(): void {
    const { projectId } = this.selectedProject;
    const selectedProjects = this.projectFormArray.controls.map((control) => ({
      project: control.get('selectedOption')?.value,
      quantity: control.get('quantity')?.value,
    }));
  
    const amounts = selectedProjects.map((project) => {
      const validQuantity = project.quantity && project.quantity > 0 ? project.quantity : 0;
      return validQuantity;
    });
  
    const totalQuantityBurned = amounts.reduce((total, quantity) => total + quantity, 0);
    this.projectService.burnTokens(
      this.secretKey,
      selectedProjects.map(project => project.project),
      amounts.map(amount => (amount * 1000000000).toString()),
      this.selectedProject.projectName,
      projectId,
      'Đốt token để phân bổ cho dự án', 
      'Phân bổ token cho quỹ dự án',   
      'Đốt token vì đã đạt được cột mốc của dự án', 
      `Đã đốt ${totalQuantityBurned} token để tài trợ cho giai đoạn 1 của dự án`     
    ).subscribe(
      (response) => {
        this.message.success(`Giao dịch burn thành công. Tổng số lượng đã thực hiện: ${totalQuantityBurned}.`);
        this.projectService.updateQuantityBurn(projectId, totalQuantityBurned).subscribe(
          () => {
            this.message.success(`Cập nhật số lượng burn cho dự án thành công.`);
            setTimeout(() => {
              this.loadProjects();
            }, 3000);
          },
          (error) => {
            this.message.error('Đã có lỗi xảy ra khi cập nhật số lượng burn!');
            console.error('Lỗi API khi cập nhật quantityBurn:', error);
          }
        );
      },
      (error) => {
        this.message.error('Đã có lỗi xảy ra khi burn token!');
        console.error('Lỗi API khi burn token:', error);
      }
    );
  
    this.closeModal();
  }
  
  
  addProject(): void {
    const projectFormGroup = this.createProject();
    this.projectFormArray.push(projectFormGroup);
    this.projectFormArray.updateValueAndValidity();
  }

  createProject(): FormGroup {
    return this.fb.group({
      selectedOption: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(1), Validators.max(1000)]]
    });
  }

  removeProject(index: number): void {
    this.projectFormArray.removeAt(index);
  }

  deleteProject(projectId: string): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this project?',
      nzContent: '<b style="color: red;">This action cannot be undone</b>',
      nzOkText: 'Yes',
      nzOnOk: () => {
        this.projectService.deleteProject(projectId).subscribe({
          next: () => {
            this.projects2 = this.projects2.filter(projects2 => projects2.projectId !== projectId);
            this.message.success('Project deleted successfully');
          },
          error: (err) => {
            console.error('Error deleting project', err);
            this.message.error('Failed to delete project');
          }
        });
      },
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  loadUserProjects(): void {
    this.projectService.getUserIdFromToken().subscribe(userId => {
      this.projectService.getProjectsOfTradeByUserId(userId).subscribe(
        (projects: ProjectOfTrade2[]) => {
          this.projectOptions = projects;
        },
        (err) => {
          console.error('Error loading projects', err);
          this.message.error('Failed to load projects');
        }
      );
    });
  }

  loadProjects(): void {
    this.projectService.getProjectsByUserWithQuantityBurn().subscribe({
      next: (projects: ProjectDTO[]) => {
        this.projects2 = projects;
        projects.forEach(project => this.loadImages(project.projectId));
      },
      error: (err) => {
        console.error('Error loading projects', err);
        this.message.error('Failed to load projects');
      }
    });
  }

  loadImages(projectId: string): void {
    this.projectService.getImagesByProjectId(projectId, 100, 100).subscribe({
      next: (response: string[]) => {
        const imageObservables = response.map(imageName =>
          this.projectService.getImageByUrl(imageName, 100, 100)
        );
        forkJoin(imageObservables).subscribe({
          next: (blobs: Blob[]) => {
            this.imageUrls[projectId] = blobs.map(blob => URL.createObjectURL(blob));
          },
          error: (err) => {
            console.error('Error loading project images', err);
            this.message.error('Failed to load images');
          }
        });
      },
      error: (err) => {
        console.error('Error loading project images', err);
        this.message.error('Failed to load images');
      }
    });
  }

  viewProjectDetails(projectId: string): void {
    this.router.navigate(['/project-details', projectId], {
      queryParams: { mode: 'view' }
    });
  }

  navigateToAddProject(): void {
    this.router.navigate(['/project']);
  }

  navigateToRequest(projectId: string): void {
    this.router.navigate([`/form1/${projectId}`]);
  }

  navigateToRequest2(projectId: string): void {
    this.router.navigate([`/request/${projectId}`]);
  }

  navigateToMeasurementData(projectId: string): void {
    this.router.navigate(['/measurementDataList', projectId]);
  }

  downloadFile(projectId: string): void {
    this.projectService.downloadProjectFile(projectId).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'images.zip';
        a.click();
        window.URL.revokeObjectURL(url);
        this.message.success('Images downloaded successfully!');
      },
      error => {
        this.message.error('Failed to download images.');
        console.error('Error:', error);
      }
    );
  }

  updateProject(projectId: string): void {
    this.router.navigate(['/project', projectId], {
      queryParams: { mode: 'edit' }
    });
  }
}
