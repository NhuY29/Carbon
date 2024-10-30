import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Location } from '@angular/common';
import { RegisterRequest } from '../../register.interface';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [AppTranslateModule,ReactiveFormsModule, NzFormModule, NzButtonModule, NzSelectModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  validateForm: FormGroup;
  showBuyerFields = false;
  showSellerFields = false;
  isWalletActive: boolean = true; 
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private notification: NzNotificationService,
    private location: Location,
    public translate: TranslateService,
  ) {
    this.validateForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.matchPasswordValidator('password')]],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      roles: ['', [Validators.required]],
      buyerType: [''],
      fullName: [''],
      address: [''],
      phone: [''],
      organizationName: [''],
      personalId: [''],
      sellerCompanyName: [''],
      contactPerson: [''],
      contactEmail: [''],
      contactPhone: ['']
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

  ngOnInit(): void {
    this.validateForm.get('roles')?.valueChanges.subscribe(value => {
      this.showBuyerFields = value === 'BUYER';
      this.showSellerFields = value === 'SELLER';

      if (this.showBuyerFields) {
        this.validateForm.get('buyerType')?.setValidators([Validators.required]);
        this.validateForm.get('fullName')?.setValidators([Validators.required]);
        this.validateForm.get('address')?.setValidators([Validators.required]);
        this.validateForm.get('phone')?.setValidators([Validators.required, Validators.pattern('^[0-9]{10}$')]);
        this.validateForm.get('organizationName')?.setValidators([]);
        this.validateForm.get('personalId')?.setValidators([Validators.required]);

        this.validateForm.get('sellerCompanyName')?.clearValidators();
        this.validateForm.get('contactPerson')?.clearValidators();
        this.validateForm.get('contactEmail')?.clearValidators();
        this.validateForm.get('contactPhone')?.clearValidators();
      } else if (this.showSellerFields) {
        this.validateForm.get('buyerType')?.clearValidators();
        this.validateForm.get('fullName')?.clearValidators();
        this.validateForm.get('address')?.clearValidators();
        this.validateForm.get('phone')?.clearValidators();
        this.validateForm.get('organizationName')?.clearValidators();
        this.validateForm.get('personalId')?.clearValidators();

        this.validateForm.get('sellerCompanyName')?.setValidators([Validators.required]);
        this.validateForm.get('contactPerson')?.setValidators([Validators.required]);
        this.validateForm.get('contactEmail')?.setValidators([Validators.required, Validators.email]);
        this.validateForm.get('contactPhone')?.setValidators([Validators.required, Validators.pattern('^[0-9]{10}$')]);
      }

      this.validateForm.get('buyerType')?.updateValueAndValidity();
      this.validateForm.get('fullName')?.updateValueAndValidity();
      this.validateForm.get('address')?.updateValueAndValidity();
      this.validateForm.get('phone')?.updateValueAndValidity();
      this.validateForm.get('organizationName')?.updateValueAndValidity();
      this.validateForm.get('personalId')?.updateValueAndValidity();
      this.validateForm.get('sellerCompanyName')?.updateValueAndValidity();
      this.validateForm.get('contactPerson')?.updateValueAndValidity();
      this.validateForm.get('contactEmail')?.updateValueAndValidity();
      this.validateForm.get('contactPhone')?.updateValueAndValidity();
    });
  }

  matchPasswordValidator(passwordControlName: string) {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const password = this.validateForm?.get(passwordControlName)?.value;
      if (control.value !== password) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      const formData = this.validateForm.value;

      const payload: RegisterRequest = {
        userDTO: {
          username: formData.username,
          password: formData.password,
          firstname: formData.firstname,
          lastname: formData.lastname,
          roles: formData.roles === 'BUYER' ? 'ROLE_BUYER' : 'ROLE_SELLER',
          status: false
        },
        buyerDTO: formData.roles === 'BUYER' ? {
          buyerType: formData.buyerType,
          fullName: formData.fullName,
          address: formData.address,
          phone: formData.phone,
          organizationName: formData.organizationName,
          personalId: formData.personalId
        } : null,
        sellerDTO: formData.roles === 'SELLER' ? {
          companyName: formData.sellerCompanyName,
          contactPerson: formData.contactPerson,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone
        } : null
      };

      console.log('Submitting registration form with payload:', payload);
      this.apiService.registerUser(payload).subscribe({
        next: (response) => {
          if (response.success) {
            this.notification.success('Success', response.message, {
              nzPlacement: 'topRight',
              nzStyle: { top: '50px', right: '50px', zIndex: 10000 }
            });
            this.router.navigate(['/login']);
          } else {
            this.notification.error('Error', response.message, {
              nzPlacement: 'topRight',
              nzStyle: { top: '50px', right: '50px', zIndex: 10000 }
            });
          }
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.notification.error('Error', 'Registration failed. Please try again.', {
            nzPlacement: 'topRight',
            nzStyle: { top: '50px', right: '50px', zIndex: 10000 }
          });
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