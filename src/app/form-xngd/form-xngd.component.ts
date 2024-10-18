import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import SignaturePad from 'signature_pad';
import { SignatureResponse } from '../SignatureResponse .interface';
import { MeasurementDetailsDTO } from '../MeasurementDetailsDTO';
import { NzTableModule } from 'ng-zorro-antd/table';
import { MeasurementDataComponent } from '../measurement-data/measurement-data.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
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
}

export interface SellerInfo {
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}
@Component({
  selector: 'app-form-xngd',
  standalone: true,
  imports: [CommonModule,MeasurementDataComponent,NzButtonModule,NzIconModule],
  templateUrl: './form-xngd.component.html',
  styleUrl: './form-xngd.component.scss',
  
})
export class FormXNGDComponent {
  idFromRoute: string | null = null; 
  projectId: string | null = null; 
  id: string | null = null; 
  storedProjectId: string | null = null; 
  project: ProjectDTO | null = null;
  currentDate: Date = new Date();
  sellerInfo: any;
  signaturePad: SignaturePad | undefined;
  signatureDataUrl: string | null = null;
  numberOfProposals: number=1;
  measurementDetails: MeasurementDetailsDTO[] = [];
  measurementId: string | null = null; 
  documentNumber: string | null = null;
  @ViewChild('signaturePad', { static: true }) signaturePadElement!: ElementRef;
  constructor(private route: ActivatedRoute, private projectService: ApiService, private message: NzMessageService ) {}
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  totalSum: number = 0;
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.projectId = params['projectId'];
      this.id = params['id'];
      this.idFromRoute = params['idFromRoute'];
      
      if (this.projectId) {
        console.log('Received projectId:', this.projectId);
        this.getProjectDetails(this.projectId); 
        this.getSellerInfo();
        this.getSignature(this.projectId); 
      }
      console.log('Received id:', this.id);
      console.log('Received idFromRoute:', this.idFromRoute);
    });
  }
  onTotalSumChange(total: number): void {
    this.totalSum = total;
    console.log('Total Sum:', total);
  }
  
  getSellerInfo() {
    if (this.projectId) {
      this.projectService.getSellerByProjectId(this.projectId).subscribe({
        next: (data) => {
          this.sellerInfo = data;
          console.log('Thông tin người bán:', this.sellerInfo);
        },
        error: (err) => {
          console.error('Không thể lấy thông tin người bán:', err);
        }
      });
    } else {
      console.error('Không có projectId để lấy thông tin người bán.');
    }
  }
  

  getProjectDetails(projectId: string) {
    this.projectService.getProjectByProjectId(projectId).subscribe({
      next: (data: ProjectDTO) => {
        this.project = data;
      },
      error: (err) => {
        console.error('Failed to load project:', err);
      }
    });
  }

  getSignature(projectId: string) {
    this.projectService.getSignature(projectId).subscribe({
      next: (response: SignatureResponse) => {
        this.signatureDataUrl = response.signatureDataUrl;
        this.numberOfProposals = response.numberOfProposals;
        this.documentNumber = response.documentNumber; 
        console.log('Chữ ký đã lấy:', this.signatureDataUrl);
        console.log('Số lượng đề xuất:', this.numberOfProposals);
        console.log('Số hiệu văn bản:', this.documentNumber);
      },
      error: (err) => {
        console.error('Không thể lấy chữ ký:', err);
      }
    });
  }
  
getFormattedDate(): string {
  const date = this.currentDate;
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based
  const year = date.getFullYear();
  const daysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const dayOfWeek = daysOfWeek[date.getDay()];
  return `${dayOfWeek}, ngày ${day} tháng ${month} năm ${year}`;
}

resizeCanvas() {
  const canvas = this.signaturePadElement.nativeElement;
  const context = canvas.getContext('2d');
  canvas.width = window.innerWidth * 0.8; 
  canvas.height = 200; 
  context.clearRect(0, 0, canvas.width, canvas.height); 
}
exportToPDF() {
  const DATA = this.pdfContent.nativeElement;
  
  html2canvas(DATA).then(canvas => {
    const fileWidth = 208; 
    const fileHeight = (canvas.height * fileWidth) / canvas.width; 

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    const pageHeight = 295; 


    if (fileHeight > pageHeight) {
      let heightLeft = fileHeight;

      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, fileWidth, fileHeight);
        heightLeft -= pageHeight;
        position = heightLeft - fileHeight; 

        
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }
    } else {
   
      pdf.addImage(imgData, 'PNG', 0, position, fileWidth, fileHeight);
    }

    pdf.save('da-xac-nhan.pdf');
  });
}
async SendexportToPDF() {
  const DATA = this.pdfContent.nativeElement;
  console.log('Bắt đầu quá trình tạo PDF từ nội dung:', DATA);

  try {
    const canvas = await html2canvas(DATA);
    console.log('Canvas đã được tạo thành công.');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 208; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], 'yeu-cau-xac-nhan.pdf', { type: 'application/pdf' });
    console.log('File PDF đã được tạo:', file);

    const quantity = this.totalSum; 


    if (this.projectId && this.id && this.idFromRoute) {
      console.log('Project ID, ID và ID From Route đang được sử dụng để tải lên:', this.projectId, this.id, this.idFromRoute);


      this.projectService.uploadReplyPdf(this.projectId, this.idFromRoute, file, quantity).subscribe({
        next: (response) => {
          this.message.success('PDF đã được tải lên thành công!'); 
          console.log('PDF đã được tải lên thành công:', response.message);

          
          if (this.projectId) { 
            this.projectService.supplyToken(this.projectId as string, quantity).subscribe({ 
              next: (tokenResponse) => {
                this.message.success('Token đã được cấp thành công!'); 
                console.log('Token đã được cấp:', tokenResponse);
              },
              error: (tokenError) => {
                this.message.error('Lỗi khi cấp token!'); 
                console.error('Lỗi khi cấp token:', tokenError);
              }
            });
          } else {
            this.message.warning('Project ID không hợp lệ để cấp token!'); 
            console.error('Project ID không hợp lệ để cấp token.');
          }
        },
        error: (error) => {
          this.message.error('Lỗi khi tải lên PDF!'); 
          console.error('Lỗi khi tải lên PDF:', error);
        }
      });
    } else {
      this.message.warning('Project ID, ID hoặc ID From Route không hợp lệ!'); 
      console.error('Project ID, ID hoặc ID From Route không hợp lệ, không thể tải lên PDF.');
    }
  } catch (error) {
    this.message.error('Lỗi khi tạo canvas!'); 
    console.error('Lỗi khi tạo canvas:', error);
  }
}

}
