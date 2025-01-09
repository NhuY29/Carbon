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
  pageIndex: number = 1;  
  pageSize: number = 5;  
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
  onPageChange(page: number): void {
    this.pageIndex = page; 
    this.loadTransactions(); 
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
  deleteTransaction(transactionSignature: string): void {
    this.api.deleteTransaction(transactionSignature).subscribe(
      (response) => {
        console.log('Transaction deleted successfully', response);
        this.transactions = this.transactions.filter(
          (transaction) => transaction.signature !== transactionSignature
        );
      },
      (error) => {
        console.error('Error deleting transaction', error);
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
        : '';

    const fee = response.meta?.fee?.toString() || 'N/A';
    const computeUnits = response.meta?.computeUnitsConsumed?.toString() || 'N/A';

    const logMessages: string[] = response.meta?.logMessages || [];
    const accountKeys = response.transaction.message?.accountKeys || [];
    const instructions = response.transaction.message?.instructions || [];
    const postTokenBalances = response.meta?.postTokenBalances || [];

    let senderAccount = '';
    let recipientAccount = '';

    // Kiểm tra nếu giao dịch là 'MintTo'
    const mintToInstruction = instructions.find(
        (inst: any) =>
            inst.programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" &&
            inst.parsed?.type === "mintTo"
    );

    if (mintToInstruction) {
        senderAccount = mintToInstruction.parsed.info.mintAuthority || ''; // Người gửi là mintAuthority
        recipientAccount = mintToInstruction.parsed.info.account || ''; // Người nhận là account
    } else if (logMessages.some(msg => msg.includes('Program log: Instruction: InitializeMint2'))) {
        senderAccount = accountKeys.length > 0 ? accountKeys[0].pubkey : '';
        recipientAccount = accountKeys.length > 1 ? accountKeys[1].pubkey : ''; // Người nhận là accountKeys[1].pubkey
    } else if (postTokenBalances.length > 0) {
        senderAccount = postTokenBalances.length > 0 ? postTokenBalances[0].owner : '';
        recipientAccount = postTokenBalances.length > 1 ? postTokenBalances[1].owner : '';
    } else {
        senderAccount = accountKeys.length > 0 ? accountKeys[0].pubkey : '';
        recipientAccount = accountKeys.length > 1 ? accountKeys[1].pubkey : '';
    }

    const preBalance = response.meta?.preBalances?.[0] || 0;
    const postBalance = response.meta?.postBalances?.[0] || 0;
    const transactionAmount = ((preBalance - postBalance - (parseInt(fee) || 0)) / 100000).toString();

    let memo: { memo: string; }[] = [];

    if (logMessages.some(msg => msg.includes('Program log: Transaction Content:'))) {
        const contentLog = logMessages.find(msg => msg.includes('Program log: Transaction Content:'));
        memo = [{ memo: contentLog?.replace('Program log: Transaction Content:', '').trim() || 'Không có nội dung' }];
    } else if (logMessages.some(msg => msg.includes('Program log: Instruction: MintTo'))) {
        memo = [{ memo: 'Phát hành tín chỉ' }];
    } else if (logMessages.some(msg => msg.includes('Program log: Instruction: InitializeMint2'))) {
        memo = [{ memo: 'Tạo loại tín chỉ' }];
    } else if (logMessages.some(msg => msg.includes('Program log: Initialize the associated token account'))) {
        memo = [{ memo: 'Khởi tạo tài khoản tín chỉ liên kết' }];
        
        senderAccount = accountKeys.length > 0 ? accountKeys[0].pubkey : '';  // Người gửi là accountKeys[0].pubkey
    recipientAccount = accountKeys.length > 1 ? accountKeys[1].pubkey : '';
    } else if (
        logMessages.some(msg => msg === "Program 11111111111111111111111111111111 invoke [1]") &&
        logMessages.some(msg => msg === "Program 11111111111111111111111111111111 success")
    ) {
        memo = [{ memo: 'Mua tín chỉ' }];
    } else {
        memo = [{ memo: 'Chuyển tín chỉ' }];
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
