import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { ActivatedRoute } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { WithdrawalDTO } from '../withdraw-money/WithdrawalDTO';
import { CommonModule } from '@angular/common';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
@Component({
  selector: 'app-list-request-withdraw',
  standalone: true,
  imports: [AppTranslateModule,NzPaginationModule, NzIconModule, NzTypographyModule, NzCardModule, FormsModule, NzInputModule, NzMessageModule, NzButtonModule, CommonModule, NzEmptyModule, NzTagModule, NzTableModule],
  templateUrl: './list-request-withdraw.component.html',
  styleUrls: ['./list-request-withdraw.component.scss']
})
export class ListRequestWithdrawComponent implements OnInit {
  withdrawals: WithdrawalDTO[] = [];
  userId: string = '';
  isWalletActive: boolean = true;
  pageIndex: number = 1; 
  pageSize: number = 5;   

  constructor(
    private withdrawalService: ApiService,
    private route: ActivatedRoute,
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
    this.withdrawalService.getUserIdFromToken().subscribe(
      (userId) => {
        this.userId = userId;  
        this.loadWithdrawals();  
      },
      (error) => {
        console.error('Có lỗi khi lấy userId từ token', error);
      }
    );
  }

  loadWithdrawals(): void {
    this.withdrawalService.getWithdrawalsByUserId(this.userId).subscribe(
      (data) => {
        this.withdrawals = data;
      },
      (error) => {
        console.error('Lỗi khi tải yêu cầu rút tiền', error);
      }
    );
  }

  onPageChange(page: number): void {
    this.pageIndex = page; 
    this.loadWithdrawals(); 
  }
}
