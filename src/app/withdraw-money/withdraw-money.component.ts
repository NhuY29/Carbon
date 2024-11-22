import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { ApiService } from '../../api.service';
import { WithdrawalDTO } from './WithdrawalDTO';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SolanaService } from '../../solanaApi.service';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
interface TransactionDetail {
  sender: string;
  recipient: string;
  memo: { memo: string }[]; 
  transactionAmount: string;
  fee: string;
  computeUnits: string;
  blockTime: string;
  logs: string[];
  status: string;
  transaction: any;
}

@Component({
  selector: 'app-withdraw-money',
  standalone: true,
  imports: [AppTranslateModule,NzIconModule,NzTypographyModule, NzCardModule, FormsModule, NzInputModule, NzMessageModule, NzButtonModule, CommonModule, NzEmptyModule, NzTagModule, NzTableModule],
  templateUrl: './withdraw-money.component.html',
  styleUrls: ['./withdraw-money.component.scss'],
  host: { 'ngSkipHydration': '' }
})
export class WithdrawMoneyComponent implements OnInit, OnDestroy {
  countdownTime: number = 60;
  timer: string = '01:00';
  countdownInterval: any;
  withdrawals: WithdrawalDTO[] = [];
  transactionSignature: string = '';
  transactionDetails?: TransactionDetail;
  showTransactionDetails: boolean = false;
  pageIndex: number = 1;  
  pageSize: number = 5;   
  isWalletActive: boolean = true;
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private api: ApiService,
    private message: NzMessageService,
    private modal: NzModalService,
    private solanaService: SolanaService,
    public translate: TranslateService,
    private ngZone: NgZone) { 
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

  ngOnInit() {
    this.loadWithdrawals();
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
  onPageChange(page: number): void {
    this.pageIndex = page; 
    this.loadWithdrawals(); 
  }
  loadWithdrawals(): void {
    this.api.getAllWithdrawals().subscribe(
      (data) => {
        this.withdrawals = data;
        console.log('Danh sách yêu cầu rút tiền:', this.withdrawals);
        this.withdrawals.forEach((withdrawal) => {
          console.log('Username:', withdrawal.user?.username);
          console.log('Remaining Time:', withdrawal.remainingTime);
        });
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách yêu cầu rút tiền:', error);
      }
    );
  }
  updateStatus(withdrawalId: string, newStatus: string): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn duyệt yêu cầu này?',
      nzOnOk: () => {
        this.api.updateWithdrawalStatus(withdrawalId, newStatus).subscribe(
          response => {
            this.message.success('Cập nhật status thành công');
            this.loadWithdrawals();
          },
          error => {
            this.message.error('Lỗi khi cập nhật status');
            console.error('Lỗi khi cập nhật status', error);
          }
        );
      }
    });
  }
  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      if (this.countdownTime > 0) {
        this.countdownTime--;
        this.ngZone.run(() => {
          this.updateTimerDisplay();
        });
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  updateTimerDisplay(): void {
    const minutes = Math.floor(this.countdownTime / 60);
    const seconds = this.countdownTime % 60;
    this.timer = `${this.formatTime(minutes)}:${this.formatTime(seconds)}`;
  }

  formatTime(time: number): string {
    return time < 10 ? `0${time}` : `${time}`;
  }
  searchTransactionDetails(): void {
    if (this.showTransactionDetails) {
      this.showTransactionDetails = false;
      this.transactionSignature = ''; 
    } else {
      this.solanaService.getTransactionDetails(this.transactionSignature).subscribe({
        next: (response) => {
          console.log('API response:', response);
  
          if (response && response.result) {
            const transactionDetails = this.getTransactionDetailsFromResponse(response.result);
            if (transactionDetails) {
              this.transactionDetails = transactionDetails;
              this.showTransactionDetails = true; 
            } else {
              this.transactionDetails = undefined; 
              this.showTransactionDetails = false;
              this.message.error('Transaction details not found.');
            }
          } else {
            this.transactionDetails = undefined;
            this.showTransactionDetails = false;
            this.message.error('No valid result in response.');
          }
        },
        error: (err) => {
          this.transactionDetails = undefined;
          this.showTransactionDetails = false;
          this.message.error('Failed to retrieve transaction details.');
          console.error(err);
        }
      });
    }
  }
  closeTransactionDetails(): void {
    this.showTransactionDetails = false;
    this.transactionDetails = undefined;
  }
  getTransactionDetailsFromResponse(response: any): TransactionDetail {
    const blockTime = response.blockTime
      ? new Date(response.blockTime * 1000).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      : 'Không xác định';

    const fee = response.meta?.fee?.toString() || 'N/A';
    const computeUnits = response.meta?.computeUnitsConsumed?.toString() || 'N/A';

    const logMessages: string[] = response.meta?.logMessages || [];
    const accountKeys = response.transaction.message?.accountKeys || [];

    const senderAccount = accountKeys.length > 0 ? accountKeys[0].pubkey : 'Không xác định';
    const recipientAccount = accountKeys.length > 1 ? accountKeys[1].pubkey : 'Không xác định';

    const preBalance = response.meta?.preBalances?.[0] || 0;
    const postBalance = response.meta?.postBalances?.[0] || 0;
    const transactionAmount = ((preBalance - postBalance - (parseInt(fee) || 0)) / 100000).toString();
    let memo: { memo: string; }[] = [];

    if (logMessages.some(msg => msg.includes('Program log: Transaction Content:'))) {
      const contentLog = logMessages.find(msg => msg.includes('Program log: Transaction Content:'));
      memo = [{ memo: contentLog?.replace('Program log: Transaction Content:', '').trim() || 'Không có memo' }];
    } else if (logMessages.some(msg => msg.includes('Program log: Instruction: MintTo'))) {
      memo = [{ memo: 'Chuyển nhắn tin chi' }];
    } else if (logMessages.some(msg => msg.includes('Program log: Instruction: InitializeMint2'))) {
      memo = [{ memo: 'Tạo mint token' }];
    } else if (logMessages.some(msg => msg.includes('Program log: Initialize the associated token account'))) {
      memo = [{ memo: 'Tạo token address' }];
    } else if (
      logMessages.some(msg => msg === "Program 11111111111111111111111111111111 invoke [1]") &&
      logMessages.some(msg => msg === "Program 11111111111111111111111111111111 success")
    ) {
      memo = [{ memo: 'Mua tin chi' }];
    } else {
      memo = [{ memo: 'Không xác định' }];
    }

    return {
      blockTime,
      fee,
      computeUnits,
      sender: senderAccount,
      recipient: recipientAccount,
      transactionAmount,
      logs: logMessages,
      memo,
      status: response.meta?.status || 'Không xác định',
      transaction: response.transaction,
    };
  }


}
