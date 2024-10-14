import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import SignaturePad from 'signature_pad';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './signature.component.html',
  styleUrl: './signature.component.scss'
})
export class SignatureComponent implements OnInit {
  projectId: string | null = null;
  signaturePad: SignaturePad | undefined;
  signatureDataUrl: string | null = null;
  numberOfProposals: number | null = null; 
  @ViewChild('signaturePad', { static: true }) signaturePadElement!: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private projectService: ApiService,
    private message: NzMessageService ,
    private router: Router
  ) {}
  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');
    setTimeout(() => {
      this.setupSignaturePad();
    }, 0);
  }
  setupSignaturePad() {
    const canvas = this.signaturePadElement.nativeElement;
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)', 
      penColor: 'rgb(0, 0, 0)' 
    });
  }
  clearSignature() {
    this.signaturePad?.clear();
  }

  saveSignature() {
    if (!this.signaturePad) {
      this.message.warning('Chưa khởi tạo signaturePad!');
      return;
    }

    if (this.signaturePad.isEmpty()) {
      this.message.warning('Chữ ký trống!');
      return;
    }

    if (!this.numberOfProposals || this.numberOfProposals < 1) {
      this.message.error('Số lượng đề xuất là bắt buộc và phải lớn hơn 0!');
      return;
    }

    const signatureDataUrl = this.signaturePad.toDataURL('image/png');
    console.log('Chữ ký đã lưu:', signatureDataUrl);
    console.log('projectId:', this.projectId);
    console.log('Số lượng đề xuất:', this.numberOfProposals);

    if (this.projectId && this.numberOfProposals) {
      this.projectService.saveSignature(this.projectId, signatureDataUrl, this.numberOfProposals).subscribe({
        next: (response) => {
          this.message.success('Lưu chữ ký thành công!');
          this.clearSignature(); 
          this.numberOfProposals = null
          this.router.navigate([`/form1/${this.projectId}`]);

        },
        error: (err) => {
          this.message.error('Không thể lưu chữ ký!');
          console.error('Không thể lưu chữ ký:', err);
        },
      });
    } else {
      this.message.warning('Không có projectId hoặc số lượng đề xuất!');
    }
  }

  resizeCanvas() {
    const canvas = this.signaturePadElement.nativeElement;
    const context = canvas.getContext('2d');
    canvas.width = window.innerWidth * 0.8; 
    canvas.height = 200; 
    context.clearRect(0, 0, canvas.width, canvas.height); 
  }
}
