import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SampleSentDTO } from '../SampleSentDTO';
@Component({
  selector: 'app-sample-received',
  standalone: true,
  imports: [NzTableModule,CommonModule,NzTabsModule,NzBadgeModule,NzButtonModule,NzIconModule],
  templateUrl: './sample-received.component.html',
  styleUrl: './sample-received.component.scss',
  host: { 'ngSkipHydration': '' } 
})
export class SampleReceivedComponent {
  projectIds: string[] = [];
  pendingProjects: SampleSentDTO[] = [];
  doneProjects: SampleSentDTO[] = [];
  projectsSentToday: SampleSentDTO[] = [];

  constructor(private sampleReceivedService: ApiService,private router: Router) {}

  ngOnInit(): void {
    // this.loadProjectIds();
    this.getPendingProjects();
    this.getDoneProjects();
    this.getAllProjectsSentToday();
  }
  

//   loadProjectIds(): void {
//     this.sampleReceivedService.getAllProjectIds().subscribe({
//       next: (data) => {
//         this.projectIds = data.filter(item => item.projectId !== null).map(item => item.id); // Lấy danh sách id
//         console.log('Danh sách Project IDs:', this.projectIds);
//       },
//       error: (err) => {
//         console.error('Lỗi khi tải danh sách Project IDs:', err);
//       }
//     });
// }


handleProjectId(projectId: string,id:string): void {
  console.log('ProjectId của dự án được chọn:', projectId);
  console.log('id của dự án được chọn:', id);
  this.router.navigate(['/measurementDataList', projectId, id]);
}

  getPendingProjects(): void {
    this.sampleReceivedService.getAllProjectsPending().subscribe({
      next: (data: SampleSentDTO[]) => {
        this.pendingProjects = data.map(item => ({
          id: item.id,           // Lấy id
          projectId: item.projectId,
          sendDate: item.sendDate
        }));
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách các dự án:', error);
      }
    });
}

getDoneProjects(): void {
    this.sampleReceivedService.getAllProjectsDone().subscribe({
      next: (data: SampleSentDTO[]) => {
        this.doneProjects = data.map(item => ({
          id: item.id,           // Lấy id
          projectId: item.projectId,
          sendDate: item.sendDate
        }));
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách các dự án đã hoàn thành:', error);
      }
    });
}

getAllProjectsSentToday(): void {
    this.sampleReceivedService.getAllProjectsSentToday().subscribe({
      next: (data: SampleSentDTO[]) => {
        this.projectsSentToday = data.map(item => ({
          id: item.id,           // Lấy id
          projectId: item.projectId,
          sendDate: item.sendDate
        }));
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách các dự án gửi hôm nay:', error);
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
        a.download = 'yeu-cau-xac-nhan.pdf'; // Đặt tên file tải xuống
        a.click();
        window.URL.revokeObjectURL(url); // Giải phóng URL sau khi tải
      },
      error: (err) => {
        console.error('Lỗi khi tải PDF:', err); // Xử lý lỗi nếu có
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
