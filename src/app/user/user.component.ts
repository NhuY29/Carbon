import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Component, OnInit } from '@angular/core';
import { UserDTO } from '../../user.interface';
import { ApiService } from '../../api.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Page } from '../page.interface';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { Router } from '@angular/router';
import { RegisterRequest } from '../../register.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzModalModule,
    NzDividerModule,
    NzIconModule,
    NzTabsModule,
    NzSwitchModule,
    NzBadgeModule,
    NzPaginationModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  host: { 'ngSkipHydration': '' } 

})
export class UserComponent implements OnInit {
  validateForm: FormGroup;
  listOfData1: UserDTO[] = [];
  listOfData2: UserDTO[] = [];
  totalItems = 5;
  pageIndex = 1;
  pageSize = 5;
  isVisible = false;
  selectedIndex = 1;
  searchQuery = '';
  size: NzButtonSize = 'large';
  showAddForm: boolean = false;

  newUser = {
    username: '',
    firstname: '',
    lastname: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_ADMIN'
  };
  constructor(
    private fb: FormBuilder,
    private userService: ApiService,
    private notification: NzNotificationService,
    private modalService: NzModalService,
    private router: Router,
    private apiService: ApiService,
  ) {
    this.validateForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      roles: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadData1();
    this.loadData2();
    this.loadData(this.pageIndex,this.pageSize);
  }
  loadData1(): void {
    this.userService.getAllTrue().subscribe((data: UserDTO[]) => {
      this.listOfData1 = data.filter(user => !user.roles.includes('ROLE_SUPERADMIN'));
    });
  }
  
  loadData2(): void {
    this.userService.getAllFalse().subscribe((data: UserDTO[]) => {
      this.listOfData2 = data.filter(user => !user.roles.includes('ROLE_SUPERADMIN'));
    });
  }
  
  createUser(): void {
    this.showAddForm = true;
  }

  saveUser(): void {
    console.log('Form Data:', this.newUser);
    if (this.newUser.password !== this.newUser.confirmPassword) {
      this.notification.error('Lỗi', 'Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }
    const payload = {
      userDTO: {
        username: this.newUser.username,
        password: this.newUser.password,
        firstname: this.newUser.firstname,
        lastname: this.newUser.lastname,
        roles: 'ROLE_ADMIN',
        status: true
      },
      buyerDTO: null,
      sellerDTO: null
    };
    console.log('Payload:', payload);

    this.apiService.registerUser(payload).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.success) {
          this.notification.success('Success', response.message);
          this.loadData1();
          this.loadData2();
          this.loadData(this.pageIndex, this.pageSize);
          this.showAddForm = false;
          this.newUser = {
            username: '',
            firstname: '',
            lastname: '',
            password: '',
            confirmPassword: '',
            role: 'ROLE_ADMIN'
          };
        } else {
          this.notification.error('Error', response.message);
        }
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.notification.error('Error', 'Registration failed. Please try again.');
      }
    });
  }

  cancelAddUser(): void {
    this.showAddForm = false;
  }
  deleteUser(id: string): void {
    this.modalService.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa người dùng này?',
      nzOkText: 'Có',
      nzOnOk: () => {
        this.userService.delete(id).subscribe(
          response => {
            this.notification.success('Thành công', response.message);
            this.loadData1();
            this.loadData2();
            this.loadData(this.pageIndex, this.pageSize);
          },
          error => {
            const errorMessage = error.error?.message || 'Có lỗi xảy ra.';
            this.notification.error('Lỗi', errorMessage);
          }
        );
      },
      nzCancelText: 'Không',
    });
  }
  onSearch(query: string): void {
    this.searchQuery = query;
    this.loadData(this.pageIndex, this.pageSize);
  }
  loadData(pageIndex: number, pageSize: number): void {
    if (this.searchQuery) {
      this.userService.searchUsers(this.searchQuery, pageIndex, pageSize).subscribe((data: Page<UserDTO>) => {
        this.listOfData1 = data.content.filter(user => !user.roles.includes('ROLE_SUPERADMIN'));
        this.totalItems = data.totalElements;
        this.pageIndex = data.number + 1;
        this.pageSize = data.size;
      });
    } else {
      this.userService.pagination(pageIndex, pageSize).subscribe((data: Page<UserDTO>) => {
        this.listOfData1 = data.content.filter(user => !user.roles.includes('ROLE_SUPERADMIN'));
        this.totalItems = data.totalElements;
        this.pageIndex = data.number + 1;
        this.pageSize = data.size;
      });
    }
  }
  
  onQueryParamsChange(params: any): void {
    const { pageIndex, pageSize } = params;
    this.loadData(pageIndex, pageSize);
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadData(pageIndex, this.pageSize);
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.loadData(this.pageIndex, pageSize);
  }

  updateUserStatus(username: string, status: boolean): void {
    this.userService.updateStatus(username, status).subscribe(
      response => {
        if (response.success) {
          this.notification.success('Thành công', response.message);
          this.loadData1();
          this.loadData2();
          this.loadData(this.pageIndex, this.pageSize);

          this.userService.getEmailByUsername(username).subscribe(
            email => {
              this.userService.sendUpdateEmail(email).subscribe(
                emailResponse => {
                  this.notification.success('Email gửi thành công', 'Thông báo đã được gửi đến người dùng.');
                },
                emailError => {
                  this.notification.error('Lỗi gửi email', 'Có lỗi xảy ra khi gửi email.');
                }
              );
            },
            emailError => {
              this.notification.error('Lỗi', 'Có lỗi xảy ra khi lấy email.');
            }
          );
        } else {
          this.notification.error('Lỗi', response.message);
        }
      },
      error => {
        const errorMessage = error.error?.message || 'Có lỗi xảy ra.';
        this.notification.error('Lỗi', errorMessage);
      }
    );
  }
}
