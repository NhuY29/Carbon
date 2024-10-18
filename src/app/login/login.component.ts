import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTransButtonModule } from 'ng-zorro-antd/core/trans-button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ApiService } from '../../api.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NzTransButtonModule, NzFormModule, NzInputModule, ReactiveFormsModule, NzButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  validateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private router: Router,
    private location: Location,
    private authService: AuthService
  ) {
    this.validateForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      const { username, password } = this.validateForm.value;
      this.authService.login(username, password).subscribe({
        next: (response) => {
          if (response.success) {
            this.notification.success('Success', 'Login successful!', {
              nzPlacement: 'topRight',
              nzStyle: { top: '50px', right: '50px' }
            });
            localStorage.setItem('token', response.message);
            this.router.navigate(['/user']);
          } else {
            this.notification.error('Error', 'Login failed. Please try again.', {
              nzPlacement: 'topRight',
              nzStyle: { top: '50px', right: '50px', zIndex: 10000 }, // Đảm bảo zIndex cao hơn overlay
              nzDuration: 5000 // Thời gian hiển thị thông báo (ms)
            });
            
          }
        },
        error: (error) => {
          console.error('Login failed', error);
          this.notification.error('Error', 'Login failed. Please try again.', {
            nzPlacement: 'topRight',
            nzStyle: { top: '50px', right: '50px' }
          });
          this.closeForm(); // Đóng form khi có lỗi xảy ra
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
  
  closeForm(): void {
    this.location.back(); // Đóng form hoặc quay về trang trước đó
  }
  
}