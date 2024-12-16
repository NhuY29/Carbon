import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
export interface ImageDTO {
  imageId: string;
  url: string;
}

export interface ProjectDTO {
  projectId: string;
  projectName: string;
  projectDescription: string;
  field: string,
  projectStatus: string;
  projectStartDate: string;
  projectEndDate: string;
  projectCode: string;
  images: ImageDTO[];
  quantityBurn: number;
  quantityNoburn: number;
}

@Component({
  selector: 'app-noburn',
  standalone: true,
  imports: [AppTranslateModule,NzTableModule,CommonModule,NzButtonModule,NzIconModule], 
  templateUrl: './noburn.component.html',
  styleUrl: './noburn.component.scss'
})
export class NoburnComponent {
  projects: ProjectDTO[] = [];
  imageUrls: { [key: string]: string[] } = {};
  isWalletActive: boolean = true;
  constructor(public translate: TranslateService,private projectService: ApiService,private message: NzMessageService, private router: Router,private modal: NzModalService,  ) {
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
    this.loadProjects();
  }
  deleteProject(projectId: string): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this project?',
      nzContent: '<b style="color: red;">This action cannot be undone</b>',
      nzOkText: 'Yes',
      nzOnOk: () => {
        this.projectService.deleteProject(projectId).subscribe({
          next: () => {
            this.projects = this.projects.filter(project => project.projectId !== projectId);
            this.message.success('Project deleted successfully');
          },
          error: (err) => {
            console.error('Lỗi khi xóa dự án', err);
            this.message.error('Failed to delete project');
          }
        });
      },
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }
  loadProjects(): void {
    this.projectService.getProjectsByUserWithQuantityNull().subscribe({
      next: (projects: ProjectDTO[]) => {
        this.projects = projects;
        projects.forEach(project => {
          this.loadImages(project.projectId);
        });
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách dự án', err);
        this.message.error('Failed to load projects: ' + err.message);
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
  navigateToRequest(projectId: string) {
    this.router.navigate([`/form1/${projectId}`]);
  }
  navigateToRequest2(projectId: string) {
    this.router.navigate([`/request/${projectId}`]);
  }
  loadImages(projectId: string): void {
    this.projectService.getImagesByProjectId(projectId, 100, 100).subscribe({
      next: (response: string[]) => {
        const imageObservables = response.map(imageName => this.projectService.getImageByUrl(imageName, 100, 100));
        forkJoin(imageObservables).subscribe({
          next: (blobs: Blob[]) => {
            this.imageUrls[projectId] = blobs.map(blob => URL.createObjectURL(blob));
          },
          error: (err) => {
            console.error('Lỗi khi tải hình ảnh của dự án', err);
            this.message.error('Failed to load images.');
          }
        });
      },
      error: (err) => {
        console.error('Lỗi khi tải hình ảnh của dự án', err);
        this.message.error('Failed to load images.');
      }
    });
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
    this.router.navigate(['/project', projectId],{
      queryParams: { mode: 'edit' }
    });
  }
}
