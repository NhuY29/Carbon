import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import SignaturePad from 'signature_pad';
import { SignatureResponse } from '../SignatureResponse .interface';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  selector: 'app-form1',
  standalone: true,
  imports: [CommonModule,NzButtonModule,NzIconModule],
  templateUrl: './form1.component.html',
  styleUrls: ['./form1.component.scss']
})
export class Form1Component implements OnInit {
  projectId: string | null = null;
  project: ProjectDTO | null = null;
  currentDate: Date = new Date();
  sellerInfo: any;
  signaturePad: SignaturePad | undefined;
  signatureDataUrl: string | null = null;
  numberOfProposals: number = 1;
  documentNumber: string | null = null;
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  @ViewChild('signaturePad', { static: true }) signaturePadElement!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private projectService: ApiService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');

    if (this.projectId) {
      this.getProjectDetails(this.projectId);
      this.getSellerInfo();
      this.getSignature(this.projectId);
    }
  }

  getSellerInfo() {
    this.projectService.getInfoSellerByToken().subscribe({
      next: (data) => {
        this.sellerInfo = data;
        console.log('Thông tin người bán:', this.sellerInfo);
      },
      error: (err) => {
        console.error('Không thể lấy thông tin người bán:', err);
      }
    });
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
        const fileWidth = 208; // Chiều rộng PDF (A4 - 210mm - padding)
        const fileHeight = (canvas.height * fileWidth) / canvas.width; // Chiều cao tương ứng với kích thước ảnh

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;
        const pageHeight = 295; // Chiều cao trang PDF (A4)

        // Nếu chiều cao của canvas lớn hơn chiều cao trang A4, chia nó ra nhiều trang
        if (fileHeight > pageHeight) {
            let heightLeft = fileHeight;

            while (heightLeft > 0) {
                pdf.addImage(imgData, 'PNG', 0, position, fileWidth, fileHeight); // Chỉ truyền các tham số cần thiết
                heightLeft -= pageHeight;
                position = heightLeft - fileHeight; // Cập nhật vị trí cho trang tiếp theo

                // Nếu vẫn còn nội dung, thêm trang mới
                if (heightLeft > 0) {
                    pdf.addPage();
                }
            }
        } else {
            // Nội dung vừa một trang, không cần thêm trang
            pdf.addImage(imgData, 'PNG', 0, position, fileWidth, fileHeight);
        }

        pdf.save('yeu-cau-xac-nhan.pdf');
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
    const imgWidth = 208; // Chiều rộng PDF (A4 - 210mm - padding)
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Chiều cao tương ứng với kích thước ảnh

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight); // Chỉ truyền các tham số cần thiết

    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], 'yeu-cau-xac-nhan.pdf', { type: 'application/pdf' });
    console.log('File PDF đã được tạo:', file);

    if (this.projectId) {
      console.log('Project ID đang được sử dụng để tải lên:', this.projectId); 
      
      this.projectService.uploadPdf(this.projectId, file).subscribe({
        next: (response) => {
          console.log('PDF đã được tải lên thành công:', response.message);
          this.message.success('PDF đã được tải lên thành công!'); // Hiển thị thông báo thành công
        },
        error: (error) => {
          console.error('Lỗi khi tải lên PDF:', error);
          this.message.error('Lỗi khi tải lên PDF. Vui lòng thử lại.'); // Hiển thị thông báo lỗi
        }
      });
    } else {
      console.error('Project ID không hợp lệ, không thể tải lên PDF.');
      this.message.error('Project ID không hợp lệ.'); // Thông báo lỗi khi Project ID không hợp lệ
    }
  } catch (error) {
    console.error('Lỗi khi tạo canvas:', error);
    this.message.error('Lỗi khi tạo PDF. Vui lòng thử lại.'); // Hiển thị thông báo lỗi khi tạo PDF thất bại
  }
}

}