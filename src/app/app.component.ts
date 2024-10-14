import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { RegisterComponent } from "./register/register.component";
import { LoginComponent } from './login/login.component';
import { AuthService } from './services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserComponent } from './user/user.component';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { ApiService } from '../api.service';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NzAvatarModule, NzButtonModule, NzPopoverModule, CommonModule, RouterLink, RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule, RegisterComponent, RouterLinkActive, RegisterComponent, LoginComponent, UserComponent,],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  walletInfo: any;
  isCollapsed = false;
  username: string = '';
  avatarUrl: string = '';
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private modal: NzModalService,
    private authService: AuthService,
    private notification: NzNotificationService,
    private apiService: ApiService
  ) { }
  logout() {
    this.authService.logout();
    localStorage.removeItem('token');
    window.location.replace('/login');
    this.notification.success('Success', 'Logout successful!');
  }
  loading = false;
  ngOnInit(): void {
    this.getUsername();
  }
  getWalletInfo() {
    if (this.walletInfo || this.loading) {
      return;
    }

    this.loading = true;
    this.apiService.getWalletInfo().subscribe(
      (response: any) => {
        console.log('Wallet Info:', response);
        this.walletInfo = {
          address: response.address,
          balance: response.balance
        };
      },
      error => {
        console.error('Error getting wallet info:', error);
        this.walletInfo = null;
      },
      () => {
        this.loading = false;
      }
    );
  }
  openTransactionForm(): void {
    this.modal.create({
      nzTitle: 'Thực hiện giao dịch',
      nzContent: TransactionFormComponent,
      nzFooter: null,
    });
  }
  openTransactionHistory(): void {
    this.modal.create({
      nzContent: TransactionHistoryComponent,
      nzFooter: null,
      nzStyle: { width: '1700px' }
    });
  }
  getUsername(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token') || '';

      if (token) {
        this.apiService.getUsername(token).subscribe(
          (username: string) => {
            console.log('Username received from API:', username);
            this.username = username;
          },
          error => {
            console.error('Error fetching username:', error);
          }
        );
      } else {
        console.warn('No token found in localStorage.');
      }
    } else {
      console.warn('This code is running on the server-side.');
    }
  }

}
