import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { AppTranslateModule } from '../translate.module';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-airdrop',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzInputModule,
    NzMessageModule,
    FormsModule,
    NzFormModule,
    NzAlertModule,
    AppTranslateModule
  ],
  templateUrl: './airdrop.component.html',
  styleUrls: ['./airdrop.component.scss']
})
export class AirdropComponent {
  recipientPubkey: string = '';
  amount: number = 0;
  responseMessage: string = '';
  isWalletActive: boolean = true;
  constructor(private apiService: ApiService, public translate: TranslateService,) {
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

  airdrop() {
    if (this.amount < 1000) {
      this.responseMessage = 'Số tiền phải ít nhất là 1,000.';
      return;
    }
    const adjustedAmount = this.amount / 10000;

    this.apiService.airdropFunds(this.recipientPubkey, adjustedAmount).subscribe(
      response => {
        this.responseMessage = `Airdrop successful. Transaction signature: ${response}`;
      },
      error => {
        this.responseMessage = `Airdrop failed: ${error.message}`;
      }
    );
  }
}
