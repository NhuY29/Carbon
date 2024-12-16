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
import { ProjectDTO } from '../ProjectDTO';
@Component({
  selector: 'app-project-deny',
  standalone: true,
  imports: [AppTranslateModule,NzTableModule,CommonModule,NzButtonModule,NzIconModule], 
  templateUrl: './project-deny.component.html',
  styleUrl: './project-deny.component.scss'
})
export class ProjectDenyComponent {
  projects: ProjectDTO[] = [];  // Danh sách dự án bị từ chối
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
  loadProjects(): void {
    this.projectService.getProjectsDeny().subscribe({
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

  viewProjectDetails(projectId: string): void {
    this.router.navigate(['/project', projectId]);
  }
}
