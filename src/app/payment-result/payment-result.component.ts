import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Observable } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [AppTranslateModule,CommonModule, NzTableModule], 
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.scss']
})
export class PaymentResultComponent implements OnInit {
  result: string | null = null;
  paymentDetails: { name: string; value: string | number | null }[] = [];
  errorCode: string | null = null;
  message: string | null = null; 
  isWalletActive: boolean = true;
  constructor(public translate: TranslateService,private http: HttpClient, private route: ActivatedRoute, private api: ApiService) {
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
    const params = this.route.snapshot.queryParams;
    this.api.getPaymentResult(
      params['vnp_Amount'],
      params['vnp_TxnRef'],
      params['vnp_PayDate'],
      params['vnp_ResponseCode'],
      params['vnp_SecureHash'],
      params['vnp_OrderInfo'],
      params['vnp_BankCode'],
      params['vnp_BankTranNo'],
      params['vnp_CardType'],
      params['vnp_TmnCode'],
      params['vnp_ResponseCode'],
    ).subscribe(
      response => {
        this.result = response.status === 'OK' ? 'success' : 'error';
        this.message = response.message;
        console.log('Payment Details:', this.paymentDetails);

        if (response.data) {
          const amount = parseInt(response.data.amount, 10) / 100; 
          const formattedAmount = amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); 

          this.paymentDetails = [
            { name: 'Transaction Reference', value: response.data.txnRef },
            { name: 'Amount', value: formattedAmount }, 
            { name: 'Bank Code', value: response.data.bankCode },
            { name: 'Bank Transaction No', value: response.data.bankTranNo },
            { name: 'Card Type', value: response.data.cardType },
            { name: 'Order Info', value: response.data.orderInfo },
            { name: 'Payment Date', value: response.data.payDate },
            { name: 'Tmn Code', value: response.data.tmnCode },
            { name: 'Username', value: response.data.username }
          ];        
          this.errorCode = null; 
        } else {
          this.errorCode = response.status === 'OK' ? null : response.data.responseCode;
        }
      },
      error => {
        console.error('Lỗi khi lấy kết quả thanh toán:', error);
        this.result = 'error';
        this.errorCode = error.message;
      }
    );    
  }
}
