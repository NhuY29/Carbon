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
}

@Component({
  selector: 'app-list-project',
  standalone: true,
  imports: [AppTranslateModule,NzTableModule, CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './list-project.component.html',
  styleUrls: ['./list-project.component.scss'],
  host: { 'ngSkipHydration': '' } 
})
export class ListProjectComponent implements OnInit {
  projects: ProjectDTO[] = [];
  imageUrls: { [key: string]: string[] } = {};
  selectedProjectParticipants: any[] | null = null;
  selectedProjectName: string = '';
  joinedProjects: { [key: string]: boolean } = {}; 
  isWalletActive: boolean = true;
  constructor(
    private apiService: ApiService,
    private modal: NzModalService,
    private message: NzMessageService,
    private router: Router,
    public translate: TranslateService,
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
  }

  ngOnInit(): void {
    this.loadProjects();
  }
  navigateToMeasurementData(projectId: string): void {
    this.router.navigate(['/measurementDataList', projectId]);
  }
  loadProjects(): void {
    this.apiService.getProjects().subscribe({
      next: (projects: ProjectDTO[]) => {
        this.projects = projects;
        projects.forEach(project => {
          this.checkProjectParticipation(project.projectId);
          this.loadImages(project.projectId);
        });
      },
      error: (err) => console.error('Lỗi khi tải danh sách dự án', err)
    });
  }
  checkProjectParticipation(projectId: string): void {
    const token = localStorage.getItem('token') || '';
    this.apiService.checkProjectParticipation(token, projectId).subscribe({
      next: (isJoined: boolean) => {
        this.joinedProjects[projectId] = isJoined; 
      },
      error: (err) => {
        console.error('Lỗi khi kiểm tra trạng thái tham gia dự án', err);
      }
    });
  }
  joinProject(projectId: string): void {
    const token = localStorage.getItem('token') || '';
    const confirmed = window.confirm('Are you sure you want to join this project?');

    if (confirmed) {
      this.apiService.joinProject(token, projectId).subscribe({
        next: () => {
          this.message.success('Tham gia dự án thành công!');
          this.joinedProjects[projectId] = true; 
        },
        error: (err) => {
          this.message.error('Lỗi khi tham gia dự án.');
          console.error('Error:', err);
        }
      });
    }
  }
  deleteProject(projectId: string): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this project?',
      nzContent: '<b style="color: red;">This action cannot be undone</b>',
      nzOkText: 'Yes',
      nzOnOk: () => {
        this.apiService.deleteProject(projectId).subscribe({
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
  loadImages(projectId: string): void {
    this.apiService.getImagesByProjectId(projectId, 100, 100).subscribe({
      next: (response: string[]) => {
        const imageObservables = response.map(imageName => this.apiService.getImageByUrl(imageName, 100, 100));
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
  downloadFile(projectId: string): void {
    this.apiService.downloadProjectFile(projectId).subscribe(
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
  userId: string = '';

  viewParticipants(projectId: string): void {
    this.router.navigate(['/project', projectId, 'participants']);
  }
  navigateToAddProject(): void {
    this.router.navigate(['/project']);
  }
}
