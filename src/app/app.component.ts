import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { RegisterComponent } from "./register/register.component";
import { LoginComponent } from './login/login.component';
import { AuthService } from './services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserComponent } from './user/user.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { HttpClient } from '@angular/common/http';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from './translate.module';
import { ApiService } from '../api.service';
import { SharedService } from './shared-service.service';
import { UserService } from './guards/UserService';
import { RoleService } from './guards/RoleService';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzPopoverModule,
    NzButtonModule,
    NzAvatarModule,
    RegisterComponent,
    LoginComponent,
    UserComponent,
    AppTranslateModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: { 'ngSkipHydration': '' }
})
export class AppComponent implements OnInit {
  walletInfo: any;
  isCollapsed = false;
  username: string = '';
  avatarUrl: string = '';
  loading = false;
  isWalletActive: boolean = true;
  role: string | null = null;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private modal: NzModalService,
    private authService: AuthService,
    private notification: NzNotificationService,
    private apiService: ApiService,
    public translate: TranslateService,
    private sharedService: SharedService,
    private userService: UserService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUsername();
    if (isPlatformBrowser(this.platformId)) {
      const savedState = localStorage.getItem('isWalletActive');
      this.isWalletActive = savedState === 'true';
      console.log(`menu: ${this.isWalletActive ? 'ACTIVE' : 'INACTIVE'}`);

      if (this.isWalletActive) {
        this.translate.use('vi'); 
        console.log('use vi');
      } else {
        this.translate.use('en'); 
        console.log('use en');
      }
    }

    this.sharedService.currentLanguage.subscribe(language => {
      
      if (this.isWalletActive) {
        this.translate.use('vi'); 
        console.log('use vi');
      } else {
        this.translate.use('en'); 
        console.log('use en');
      }
    });
    this.roleService.getRole().subscribe(role => {
      this.role = role;
    });
     this.checkToken();
}
checkToken(): void {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No token found in localStorage.');
    this.router.navigate(['/login']);
  }
}
  switchLanguage(language: string) {
    this.translate.use(language);
  }
  logout() {
    this.authService.logout();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('language');
    }
    window.location.replace('/login');
    this.notification.success('Success', 'Logout successful!');
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
