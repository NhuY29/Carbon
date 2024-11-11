import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SolanaService } from '../../solanaApi.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzModalModule,
    AppTranslateModule
  ],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  host: { 'ngSkipHydration': '' }
})
export class WalletComponent {
  publickey: string = '';
  balance: number | null = null;
  transactionHistory: any[] = [];
  isModalVisible = false;
  selectedTransaction: any = null;
  isWalletActive: boolean = true;
  constructor(
    private solanaService: SolanaService,
    private message: NzMessageService,
    private modal: NzModalService,
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

  onPublicKeyChange(): void {
    if (this.publickey) {
      this.checkBalance();
      this.getTransactionHistory();
    } else {
      this.balance = null;
      this.transactionHistory = [];
    }
  }

  checkBalance(): void {
    this.solanaService.getBalance(this.publickey).subscribe({
      next: (data) => {
        this.balance = data.result.value / 100000;
        console.log('Calculated Balance:', this.balance);
        this.message.success('Balance retrieved successfully!');
      },
      error: (err) => {
        this.message.error('Failed to retrieve balance. Please check the public key.');
        console.error(err);
      }
    });
  }

  getTransactionHistory(): void {
    this.solanaService.getTransactionHistory(this.publickey).subscribe({
      next: (data) => {
        this.transactionHistory = data.result;
        if (this.transactionHistory.length === 0) {
          this.message.info('No transactions found.');
        } else {
          this.message.success('Transaction history retrieved successfully!');
        }
      },
      error: (err) => {
        this.message.error('Failed to retrieve transaction history.');
        console.error(err);
      }
    });
  }

  viewTransactionDetails(signature: string): void {
    this.solanaService.getTransactionDetails(signature).subscribe({
      next: (data) => {
        this.selectedTransaction = data.result;
        console.log('Selected Transaction:', this.selectedTransaction);
        if (this.selectedTransaction) {
          this.openModal();
        } else {
          this.message.error('Transaction details not found.');
        }
      },
      error: (err) => {
        this.message.error('Failed to retrieve transaction details.');
        console.error(err);
      }
    });
  }

  openModal(): void {
    this.modal.create({
      nzTitle: 'Transaction Details',
      nzContent: this.getTransactionDetailsTemplate(),
      nzFooter: null
    });
  }
  handleCancel(): void {
    this.isModalVisible = false;
    this.selectedTransaction = null;
  }
  getTransactionDetailsTemplate(): string {
    if (!this.selectedTransaction) {
      return '';
    }

    const blockTime = this.selectedTransaction.blockTime
      ? new Date(this.selectedTransaction.blockTime * 1000).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      : 'Không xác định';
    const fee = this.selectedTransaction.meta?.fee || 'N/A';
    const dividedFee = fee / 10000;
    const computeUnits = this.selectedTransaction.meta?.computeUnitsConsumed || 'N/A';

    const logMessages: string[] = this.selectedTransaction.meta?.logMessages || [];
    const accountKeys = this.selectedTransaction.transaction.message?.accountKeys || [];

    const senderAccount = accountKeys.length > 0 ? accountKeys[0].pubkey : 'Không xác định';
    const recipientAccount = accountKeys.length > 1 ? accountKeys[1].pubkey : 'Không xác định';

    const preBalance = this.selectedTransaction.meta?.preBalances?.[0] || 0;
    const postBalance = this.selectedTransaction.meta?.postBalances?.[0] || 0;
    const transactionAmount = (preBalance - postBalance - fee) / 100000;
    const memoLogsHtml = logMessages
      .filter(msg => msg.includes('Program log: Memo'))
      .map(msg => {
        const match = msg.match(/"([^"]+)"/);
        return match ? `<li>${match[1]}</li>` : '';
      })
      .join('');

    return `
      <div>
        <p><strong>Thời Gian Giao Dịch:</strong> ${blockTime}</p>
        <p><strong>Phí Giao Dịch:</strong> ${dividedFee} VND</p>
        <p><strong>Số Đơn Vị Tính Toán Tiêu Tốn:</strong> ${computeUnits}</p>
        <p><strong>Người Gửi:</strong> ${senderAccount}</p>
        <p><strong>Người Nhận:</strong> ${recipientAccount}</p>
        <p><strong>Số Tiền Giao Dịch:</strong> ${transactionAmount} VND</p>
        <h3>Thông Điệp Ghi Lại (Memo):</h3>
          ${memoLogsHtml}
      </div>
    `;
  }

}
