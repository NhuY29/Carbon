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
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';

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
export interface TransactionToken {
  signature: string;
  date: string;
  block: number;
  age: number;
  expand?: boolean;
  details?: any;

  blockTime?: number;
  slot?: number;
  meta?: {
    computeUnitsConsumed?: number;
    err?: any;
    fee?: number;
    logMessages?: string[];
    preBalances?: number[];
    postBalances?: number[];
    rewards?: any[];
    postTokenBalances?: any[];
    preTokenBalances?: any[];
  };

  logMessages?: string[];
  filteredLogMessages?: string[];
}

@Component({
  selector: 'app-token',
  standalone: true,
  imports: [NzSpinModule, NzButtonModule, AppTranslateModule, NzModalModule, CommonModule, NzCardModule, NzTableModule, NzBadgeModule, NzDividerModule, NzDropDownModule],
  templateUrl: './token.component.html',
  styleUrl: './token.component.scss'
})
export class TokenComponent implements OnInit {
  listOfData: any[] = [];
  isWalletActive: boolean = true;
  transactions: any[] = [];
  selectedTransaction: any = null;
  error: string = '';
  tokenAddress: string = '';

  constructor(
    private solanaService: SolanaService,
    public translate: TranslateService,
    private message: NzMessageService,
    private api: ApiService
  ) {
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');
    const savedState = localStorage.getItem('isWalletActive');
    this.isWalletActive = savedState === 'true';
    console.log(`Initial wallet state: ${this.isWalletActive ? 'ACTIVE' : 'INACTIVE'}`);
    this.translate.use(this.isWalletActive ? 'vi' : 'en');
  }

  ngOnInit(): void {
    this.getTokenData();
    this.listOfData.forEach(item => {
      this.onGetTransactionHistory(item.tokenAddress);
    });
  }
  onGetTransactionHistory(tokenAddress: string): void {
    if (!tokenAddress) {
      this.error = 'Please enter a token address.';
      return;
    }

    this.api.getTransactionHistoryAddressToken(tokenAddress).subscribe(
      data => {
        if (data && Array.isArray(data.transactions)) {
          const transactionsWithDetails: Observable<Transaction>[] = data.transactions.map((transaction: any) => {
            return this.solanaService.getTransactionDetails(transaction.signature).pipe(
              map((details: any) => {
                return {
                  signature: transaction.signature,
                  date: transaction.timestamp,
                  block: transaction.block,
                  age: transaction.age,
                };
              })
            );
          });

          forkJoin(transactionsWithDetails).subscribe(
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
  toggleTransactionDetails(tx: TransactionToken): void {
    tx.expand = !tx.expand;

    this.solanaService.getTransactionDetails(tx.signature).subscribe(
      (data) => {
        tx.details = data.result;
        tx.blockTime = tx.details?.blockTime;
        tx.slot = tx.details?.slot;

        tx.meta = {
          computeUnitsConsumed: tx.details?.meta?.computeUnitsConsumed,
          err: tx.details?.meta?.err,
          fee: tx.details?.meta?.fee,
          logMessages: tx.details?.meta?.logMessages || [],
          preBalances: tx.details?.meta?.preBalances || [],
          postBalances: tx.details?.meta?.postBalances || [],
          rewards: tx.details?.meta?.rewards || [],
          postTokenBalances: tx.details?.meta?.postTokenBalances || [],
          preTokenBalances: tx.details?.meta?.preTokenBalances || [],
        };

        const logMessages = tx.details?.meta?.logMessages || [];
        const filteredMessages = logMessages.map((log: string) => {
          if (log.includes('Program log: Instruction: Transfer')) {
            return 'Transfer';
          } else if (log.includes('Program log: Create')) {
            return 'Create';
          } else if (log.includes('Program log: Instruction: MintTo')) {
            return 'MintTo';
          }
          return '';
        }).filter((message: string) => message !== '');

        tx.filteredLogMessages = filteredMessages;
        console.log('Transaction details:', tx.details);
      },
      (error) => {
        console.error('Error fetching transaction details:', error);
      }
    );
  }

  getTokenData(): void {
    this.api.getTokenSolana().subscribe(
      (data) => {
        console.log(data);
        this.listOfData = data.tokens || [];
      },
      (error) => {
        console.error('Error fetching token data', error);
        this.listOfData = [];
      }
    );
  }
}
