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
import { TranslateService } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
interface TransactionDetail {
  sender: string;
  recipient: string;
  memo: { memo: string }[];
  transactionAmount: string;
  fee: string;
  computeUnits: string;
  blockTime: string;
}


interface Transaction {
  signature: string;
  date: string | null;
  details?: TransactionDetail;
  expand: boolean;
  block: number;
  age: string;
}


@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [AppTranslateModule,NzModalModule, CommonModule, NzCardModule, NzTableModule, NzBadgeModule, NzDividerModule, NzDropDownModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  transactions: Transaction[] = [];
  selectedTransaction: any = null;
  isWalletActive: boolean;
  constructor(
    private message: NzMessageService,
    private modal: NzModalService,
    private api: ApiService,
    private solanaService: SolanaService,
    public translate: TranslateService
  ) { 
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');
    const savedState = localStorage.getItem('isWalletActive');
    this.isWalletActive = savedState === 'false'; 
    console.log(`Initial airdrop state: ${this.isWalletActive ? 'ACTIVE' : 'INACTIVE'}`);
  }
  loadTransactions(): void {
    this.api.getTransactionHistory().subscribe(
      data => {
        if (data && Array.isArray(data.transactions)) {

          const transactionsWithDate: Observable<Transaction>[] = data.transactions.map((transaction: any) => {
            return this.solanaService.getTransactionDetails(transaction.signature).pipe(
              map((details: any) => ({
                signature: transaction.signature,
                date: transaction.timestamp,
                block: transaction.block,
                age: transaction.age,
              }))
            );
          });

          forkJoin(transactionsWithDate).subscribe(
            (transactionsWithDetails: Transaction[]) => {
              this.transactions = transactionsWithDetails;
            },
            error => {
              console.error('Lỗi khi tải chi tiết giao dịch', error);
            }
          );
        } else {
          console.error('Dữ liệu không hợp lệ:', data);
        }
      },
      error => {
        console.error('Lỗi khi tải dữ liệu giao dịch', error);
      }
    );
  }

  ngOnInit(): void {
    this.loadTransactions();
  }
  viewTransactionDetails(transaction: Transaction): void {
    if (!transaction.details) {
      this.solanaService.getTransactionDetails(transaction.signature).subscribe({
        next: (data) => {
          const transactionDetails = this.getTransactionDetailsFromResponse(data.result);
          transaction.details = transactionDetails;
          if (!transaction.details) {
            this.message.error('Transaction details not found.');
          }
        },
        error: (err) => {
          this.message.error('Failed to retrieve transaction details.');
          console.error(err); 
        }
      });
    }
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

    // Xác định `memo` dựa trên mẫu `logMessages`
    let memo: { memo: string; }[] = [];

    if (logMessages.some(msg => msg.includes('Program log: Transaction Content:'))) {
        const contentLog = logMessages.find(msg => msg.includes('Program log: Transaction Content:'));
        memo = [{ memo: contentLog?.replace('Program log: Transaction Content:', '').trim() || 'Không có memo' }];
    } else if (logMessages.some(msg => msg.includes('Program log: Instruction: MintTo'))) {
        memo = [{ memo: 'chuyen nhan tin chi' }];
    } else if (logMessages.some(msg => msg.includes('Program log: Instruction: InitializeMint2'))) {
        memo = [{ memo: 'tao mint token' }];
    } else if (logMessages.some(msg => msg.includes('Program log: Initialize the associated token account'))) {
        memo = [{ memo: 'tao token address' }];
    } else if (
        logMessages.some(msg => msg === "Program 11111111111111111111111111111111 invoke [1]") &&
        logMessages.some(msg => msg === "Program 11111111111111111111111111111111 success")
    ) {
        memo = [{ memo: 'mua tin chi' }];
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
        memo
    };
}


}
