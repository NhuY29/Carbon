import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
import { ProjectDTO } from '../ProjectDTO';
import { CoordinateDTO } from '../CoordinateDTO';
import { UserDTO } from '../../user.interface';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { FormsModule } from '@angular/forms';
import { CommonCategoryDTO } from '../CommonCategory.interface';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NgModule } from '@angular/core';

interface ProjectDetailsDTO {
  projectName: string;
  projectDescription: string;
  projectStatus: string;
  projectStartDate: Date;
  projectEndDate: Date;
  field: string;
  type: string;
  standard: string;
  coordinates: CoordinateDTO[];
  owner: UserDTO;
}
interface SampleSentDTO {
  id: string;
  projectId: string;
  sendDate: string;
  quantity: number;
  reason: string;
  details?: ProjectDetailsDTO;  
}


interface PendingProjectDTO {
  id: string;
  projectId: string;
  sendDate: string;
  quantity: number;
  details?: ProjectDetailsDTO;
}
interface User {
  userId: string | null;
  username: string;
  password: string | null;
  firstname: string;
  lastname: string;
  roles: string | null;
  status: boolean;
  delete: boolean;
}
@Component({
  selector: 'app-sample-received',
  standalone: true,
  imports: [NzModalModule,NzFormModule,FormsModule,NzPaginationModule,AppTranslateModule, NzTableModule, CommonModule, NzTabsModule, NzBadgeModule, NzButtonModule, NzIconModule],
  templateUrl: './sample-received.component.html',
  styleUrls: ['./sample-received.component.scss'],
  host: { 'ngSkipHydration': '' }
})
export class SampleReceivedComponent {

  isModalVisible = false; 
  selectedProject: any;
  projectDetails: ProjectDTO | null = null;
  projectIds: string[] = [];
  pendingProjects: PendingProjectDTO[] = [];
  projectsSentToday: SampleSentDTO[] = [];
  isWalletActive: boolean = true;
  doneProjects: PendingProjectDTO[] = [];
  projectsWithStatusDaTuChoi: SampleSentDTO[] = [];
  constructor( private message: NzMessageService,private modal: NzModalService,private sampleReceivedService: ApiService, private router: Router, public translate: TranslateService) {
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
    this.getPendingProjects();
    this.getDoneProjects();
    this.getProjectsWithStatusDaTuChoi();
  }
  showRejectModal(project: any): void {
    if (project) {
      this.selectedProject = { ...project };
      this.selectedProject.rejectionReason = ''; 
      this.isModalVisible = true; 
    } else {
      console.error('Không có dự án nào được chọn.');
    }
  }
  handleCancel(): void {
    this.isModalVisible = false; 
    this.selectedProject = null;
  }
  handleOk(): void {
    if (this.selectedProject && this.selectedProject.rejectionReason) {
      this.sampleReceivedService.updateStatusToDaTuChoi(this.selectedProject.projectId, this.selectedProject.rejectionReason).subscribe(
        (response) => {
          if (response.success) {
            this.message.success(response.message);
            this.isModalVisible = false; 
            this.getPendingProjects();
            this.getDoneProjects();
            this.getProjectsWithStatusDaTuChoi();
          } else {
            this.message.error('Cập nhật thất bại: ' + response.message);
          }
        },
        (error) => {
          console.error('Lỗi khi gọi API:', error);
          this.message.error('Lỗi không xác định. Vui lòng thử lại!');
        }
      );
    } else {
      this.message.warning('Vui lòng nhập lý do từ chối.');
    }
  }
  goToMap(projectId: string): void {
    this.router.navigate(['/ggmap', projectId]); 
  }
  
  getProjectDetails(projectId: string): Promise<ProjectDetailsDTO> {
    return new Promise((resolve, reject) => {
      this.sampleReceivedService.getProjectByProjectId(projectId).subscribe({
        next: async (data: ProjectDTO) => {
          try {
            const typeName = await this.getCategoryNameById(data.type);
            const standardName = await this.getCategoryNameById(data.standard);
  
            const projectDetails: ProjectDetailsDTO = {
              coordinates: data.coordinates,
              type: typeName, 
              standard: standardName, 
              field: data.field,
              projectName: data.projectName,
              projectDescription: data.projectDescription,
              projectStatus: data.projectStatus,
              projectStartDate: new Date(data.projectStartDate),
              projectEndDate: new Date(data.projectEndDate),
              owner: data.user
            };
            resolve(projectDetails);
          } catch (error) {
            console.error('Lỗi khi lấy tên danh mục:', error);
            reject(error);
          }
        },
        error: (error) => {
          console.error('Lỗi khi lấy chi tiết dự án:', error);
          reject(error);
        }
      });
    });
  }
  getCategoryNameById(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.sampleReceivedService.getCategoryById2(id).subscribe({
        next: (category: CommonCategoryDTO) => {
          resolve(category.name); 
        },
        error: (error) => {
          console.error('Lỗi khi lấy tên danh mục:', error);
          reject(error);
        }
      });
    });
  }
  


  handleProjectId(projectId: string, id: string): void {
    console.log('ProjectId của dự án được chọn:', projectId);
    console.log('id của dự án được chọn:', id);
    this.router.navigate(['/measurementDataList', projectId, id]);
  }

  getPendingProjects(): void {
    this.sampleReceivedService.getAllProjectsPending().subscribe({
      next: async (data: SampleSentDTO[]) => {
        console.log('Dữ liệu dự ánnn:', data);
        const pendingProjectsTemp: PendingProjectDTO[] = data.map(item => ({
          id: item.id,
          projectId: item.projectId,
          sendDate: item.sendDate,
          reason: item.reason,
          quantity: item.quantity
        }));

        const projectDetailsPromises = pendingProjectsTemp.map(async project => {
          const details = await this.getProjectDetails(project.projectId);
          return {
            ...project,
            details
          } as PendingProjectDTO;
        });

        Promise.all(projectDetailsPromises).then(fullProjectData => {
          this.pendingProjects = fullProjectData;
          console.log('Dữ liệu dự án đầy đủ:', this.pendingProjects);
        });
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách các dự án:', error);
      }
    });
  }

  getDoneProjects(): void {
    this.sampleReceivedService.getAllProjectsDone().subscribe({
      next: async (data: SampleSentDTO[]) => {
        const doneProjectsTemp: PendingProjectDTO[] = data.map(item => ({
          id: item.id,
          projectId: item.projectId,
          sendDate: item.sendDate,
          quantity: item.quantity,
          reason: item.reason
        }));

        const projectDetailsPromises = doneProjectsTemp.map(async project => {
          const details = await this.getProjectDetails(project.projectId);
          return {
            ...project,
            details
          } as PendingProjectDTO;
        });

        Promise.all(projectDetailsPromises).then(fullProjectData => {
          this.doneProjects = fullProjectData;
          console.log('Dữ liệu dự án đã hoàn thành:', this.doneProjects);
        });
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách các dự án đã hoàn thành:', error);
      }
    });
  }

  getProjectsWithStatusDaTuChoi(): void {
    this.sampleReceivedService.getProjectsWithStatusDaTuChoi().subscribe({
      next: async (data: SampleSentDTO[]) => {
        const projectsWithStatusDaTuChoiTemp: SampleSentDTO[] = data.map(item => ({
          id: item.id,
          projectId: item.projectId,
          sendDate: item.sendDate,
          quantity: item.quantity,
          reason: item.reason

        }));
        const projectDetailsPromises = projectsWithStatusDaTuChoiTemp.map(async project => {
          let details = null;
          try {
            details = await this.getProjectDetails(project.projectId);
          } catch (error) {
            console.error(`Lỗi khi lấy chi tiết cho dự án ${project.projectId}:`, error);
          }
  
          return {
            ...project,
            details: details || {} 
          } as SampleSentDTO;
        });
        Promise.all(projectDetailsPromises).then(fullProjectData => {
          this.projectsWithStatusDaTuChoi = fullProjectData;
          console.log('Dữ liệu các dự án đã bị từ chối:', this.projectsWithStatusDaTuChoi);
        });
      },
      error: (error) => {
        console.error('Lỗi khi lấy dữ liệu các dự án đã bị từ chối:', error);
      }
    });
  }
  
  
  navigateToProject(id: string): void {
    this.router.navigate(['/project', id]);
  }

  measurementDataList(id: string): void {
    this.router.navigate(['/measurementDataList', id]);
  }

  downloadPdf(projectId: string, id: string): void {
    this.sampleReceivedService.getPdfByProjectIdAndId(projectId, id).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'yeu-cau-xac-nhan.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Lỗi khi tải PDF:', err);
      }
    });
  }

  downPdfReceived(projectId: string, id: string): void {
    console.log('projectId:', projectId);
    console.log('id:', id);
    this.sampleReceivedService.getPdfReceived(projectId, id).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'da-xac-nhan.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Lỗi khi tải PDF:', err);
      }
    });
  }
}
