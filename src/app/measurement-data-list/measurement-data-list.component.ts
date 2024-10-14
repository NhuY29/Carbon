import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

export interface MeasurementDataDTO {
  id: string;
  measurer: string;
  measurementDate: string;
  farmingProcess: string;
  phonelandowner: string;
  namelandowner: string;
  projectId: string;
}

@Component({
  selector: 'app-measurement-data-list',
  standalone: true,
  imports: [NzTableModule, CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './measurement-data-list.component.html',
  styleUrls: ['./measurement-data-list.component.scss']
})
export class MeasurementDataListComponent implements OnInit {
  measurement: MeasurementDataDTO[] = [];
  projectId: string | null = null;
  idFromRoute: string | null = null;
  constructor(
    private apiService: ApiService,
    private modal: NzModalService,
    private message: NzMessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  navigateToMeasurement(measurementId: string): void {
    this.router.navigate([`/measurementData/${measurementId}`]);
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const projectId = params.get('projectId');
      const id = params.get('id');

      this.projectId = projectId;
      this.idFromRoute = id;

      console.log('ProjectIdB:', this.projectId);
      console.log('IdN:', this.idFromRoute);

      if (this.projectId && this.idFromRoute) {
        console.log(`ProjectId: ${this.projectId}, Id: ${this.idFromRoute}`);
        this.loadProjectMeasurementData(this.projectId);
      }
      if (this.idFromRoute) {
        console.log(`ProjectId: ${this.idFromRoute}`);
        this.loadProjectMeasurementData(this.idFromRoute);
      }
    });
  }

  loadProjectMeasurementData(projectId: string): void {
    console.log('Loading measurement data for project:', projectId);
    this.apiService.getProjectMeasurementData(projectId).subscribe({
      next: (data: MeasurementDataDTO[]) => {
        console.log('Fetched data:', data);
        this.measurement = data;
      },
      error: (err) => {
        console.error('Error fetching project measurement data', err);
      }
    });
  }
  navigateToRequest2(measurement: MeasurementDataDTO) {
    this.router.navigate(['/form-xngd'], {
      queryParams: {
        projectId: measurement.projectId,
        id: measurement.id,
        idFromRoute: this.idFromRoute
      }
    });
    console.log('Navigating with projectId:', measurement.projectId);
    console.log('Navigating with id:', measurement.id);
    console.log('Navigating with idFromRoute:', this.idFromRoute);
  }
  confirmDeleteMeasurementData(measurementId: string): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa bảng đo này?',
      nzOnOk: () => this.deleteMeasurementData(measurementId),
    });
  }

  private deleteMeasurementData(measurementId: string): void {
    this.apiService.deleteMeasurementData(measurementId).subscribe({
      next: () => {
        this.measurement = this.measurement.filter(item => item.id !== measurementId);
        this.message.success('Xóa bảng đo thành công!');
      },
      error: (err) => {
        console.error('Error deleting measurement data', err);
        this.message.error('Xóa bảng đo không thành công!');
      },
    });
  }
  navigateToUpdateMeasurement(id: string): void {
    console.log('ID của bản ghi cần cập nhật:', id);
    this.router.navigate(['/measurementDataListAdd', id]);
  }

}