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
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AppTranslateModule,NzTransButtonModule, NzFormModule, NzInputModule, ReactiveFormsModule, NzButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  validateForm: FormGroup;
  isWalletActive: boolean = true;
  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private router: Router,
    private location: Location,
    private authService: AuthService,
    public translate: TranslateService,
  ) {
    this.validateForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
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
            localStorage.setItem('role', response.role);
            this.router.navigate(['/gdvi']);
          } else {
            this.notification.error('Error', 'Login failed. Please try again.', {
              nzPlacement: 'topRight',
              nzStyle: { top: '50px', right: '50px', zIndex: 10000 }, 
              nzDuration: 5000 
            });
            
          }
        },
        error: (error) => {
          console.error('Login failed', error);
          this.notification.error('Error', 'Login failed. Please try again.', {
            nzPlacement: 'topRight',
            nzStyle: { top: '50px', right: '50px' }
          });
          this.closeForm(); 
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
    this.location.back(); 
  }
  
}