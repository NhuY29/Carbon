import { Component, OnInit } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../api.service';
import { SolanaService } from '../../solanaApi.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module'
@Component({
  selector: 'app-token',
  standalone: true,
  imports: [AppTranslateModule,NzModalModule, CommonModule, NzCardModule, NzTableModule, NzBadgeModule, NzDividerModule, NzDropDownModule],
  templateUrl: './token.component.html',
  styleUrl: './token.component.scss'
})
export class TokenComponent {
  listOfData: any[] = []; 
  isWalletActive: boolean = true;
  constructor( public translate: TranslateService,private message: NzMessageService, private api: ApiService) { 
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
    this.getTokenData();
  }

  getTokenData() {
    this.api.getTokenSolana().subscribe(
        (data) => {
            console.log(data); // Kiểm tra dữ liệu trả về từ API
            this.listOfData = data.tokens || []; // Đảm bảo listOfData là một mảng
        },
        (error) => {
            console.error('Error fetching token data', error);
            this.listOfData = []; // Nếu có lỗi, khởi tạo thành mảng rỗng
        }
    );
}

  
}
