import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule } from 'ng-zorro-antd/message';

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
    NzAlertModule
  ],
  templateUrl: './airdrop.component.html',
  styleUrls: ['./airdrop.component.scss']
})
export class AirdropComponent {
  recipientPubkey: string = '';
  amount: number = 0;
  responseMessage: string = '';

  constructor(private apiService: ApiService) { }

  airdrop() {
    if (this.amount < 1000) {
      this.responseMessage = `Số tiền tối thiểu để airdrop là 1000.`;
      return;
    }
    this.apiService.airdropFunds(this.recipientPubkey, this.amount / 10000).subscribe(
      response => {
        this.responseMessage = `Airdrop successful.`;
      },
      error => {
        this.responseMessage = `Airdrop failed: ${error.message}`;
      }
    );
  }
}
