import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { ApiService } from '../../api.service';
import { NzQRCodeModule } from 'ng-zorro-antd/qr-code';
import { isPlatformBrowser } from '@angular/common';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { TransactionHistoryComponent } from '../transaction-history/transaction-history.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TokenComponent } from '../token/token.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ContactComponent } from '../contact/contact.component';
import { Contact } from '../contact/contact.modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
import jsQR from 'jsqr';
@Component({
  selector: 'app-gdvi',
  standalone: true,
  imports: [
    FormsModule,
    NzLayoutModule,
    NzButtonModule,
    NzCardModule,
    NzInputModule,
    NzIconModule,
    CommonModule,
    NzAvatarModule,
    NzQRCodeModule,
    NzTabsModule,
    TransactionFormComponent,
    TransactionHistoryComponent,
    TokenComponent,
    ReactiveFormsModule,
    ZXingScannerModule,
    ContactComponent,
    AppTranslateModule
  ],
  templateUrl: './gdvi.component.html',
  styleUrl: './gdvi.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { 'ngSkipHydration': '' }
})
export class GDViComponent implements OnInit {
  isSearchVisible = false;
  isPopoverVisible = false;
  isCopied = false;
  walletInfo: any = null;
  loading = false;
  qrCodeVisible = false;
  SendVisible = false;
  username = '';
  recipientName = '';
  selectedIndex = 0;
  transactionForm: FormGroup;
  isScanning = false;
  scannedResult = '';
  selectedDevice: MediaDeviceInfo | null = null;
  isContactListVisible = false;
  isDepositFormVisible = false;
  amount: string = '';
  errorMessage: string | null = null;
  isWalletActive: boolean = true;
  @Output() secretKeyChange = new EventEmitter<string>();
  secretKeyValue: string = '';
  private previousBalance: number | null = null;
  private hasNotifiedBalanceChange: boolean = false;
  constructor(
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public translate: TranslateService
  ) {
    this.transactionForm = this.fb.group({
      senderSecretKey: ['', [Validators.required]],
      recipient: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      message: ['']
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
  switchLanguage(language: string) {
    this.translate.use(language);
  }
  ngOnInit() {
    this.loadData();
    this.checkBalanceChange();
  }
  showDepositForm() {
    this.isDepositFormVisible = true;
  }
  onPay() {
    this.errorMessage = '';
    const numericAmount = parseInt(this.amount.replace(/[^\d]/g, ''), 10);

    if (!numericAmount || !this.username) {
      this.errorMessage = 'Số tiền không được để trống và username phải có giá trị.';
      return;
    }

    this.apiService.startPayment(numericAmount, this.username).subscribe(
      (paymentUrl) => {
        window.location.href = paymentUrl;
      },
      (error) => {
        console.error('Lỗi khi khởi tạo thanh toán', error);
        this.errorMessage = 'Có lỗi xảy ra khi khởi tạo thanh toán. Vui lòng thử lại.';
      }
    );
  }
  formatAmount() {
    this.amount = this.amount.replace(/[^0-9]/g, '');
    if (this.amount) {
      const numericAmount = parseInt(this.amount, 10);
      this.amount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
        .format(numericAmount)
        .replace('₫', '');
    }
  }
  restrictNonNumeric(event: KeyboardEvent) {
    const key = event.key;
    if (!/^[0-9]$/.test(key) &&
      key !== 'Backspace' &&
      key !== 'Tab' &&
      key !== 'Enter' &&
      key !== 'ArrowLeft' &&
      key !== 'ArrowRight') {
      event.preventDefault();
    }
  }

  private checkBalanceChange(): void {
    setInterval(() => {
      this.apiService.getWalletInfo().subscribe(
        (response: any) => {
          const currentBalance = response.balance;

          if (this.previousBalance !== null && currentBalance !== this.previousBalance) {
            if (!this.hasNotifiedBalanceChange) {
              this.messageService.warning(`Bạn đã có giao dịch mới số dư thay đổi từ ${this.previousBalance} đến ${currentBalance}.`);
              this.hasNotifiedBalanceChange = true;
            }
          } else {
            this.hasNotifiedBalanceChange = false;
          }

          this.previousBalance = currentBalance;
        },
        (error) => {
          console.error('Lỗi khi lấy thông tin ví:', error);
        }
      );
    }, 5000);
  }


  openContactList(): void {
    this.isContactListVisible = !this.isContactListVisible;
  }
  onContactSelected(contact: Contact): void {
    this.transactionForm.patchValue({
      recipient: contact.walletAddress
    });
    this.recipientName = contact.username;
    this.closeContactList();
    this.onSubmit();
  }

  closeContactList() {
    this.isContactListVisible = false;
  }
  async loadData() {
    await this.getWalletInfo();
    this.getUsername();
    this.getWalletSecretKey();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            if (code) {
              this.handleQrCodeResult(code.data);
            } else {
              this.messageService.error('Không tìm thấy mã QR trong hình ảnh.');
            }
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  startScanning() {
    this.isScanning = true;
  }

  handleQrCodeResult(resultString: string) {
    this.scannedResult = resultString;
    this.transactionForm.patchValue({ recipient: resultString });
    this.fetchUsernameFromPublicKey(resultString);
    this.isScanning = false;
    this.openSendForm();
  }

  toggleScanning() {
    this.isScanning = !this.isScanning;
  }

  fetchUsernameFromPublicKey(publicKey: string): void {
    this.apiService.getUsernameFromPublicKey(publicKey).subscribe(
      (recipientName: string) => {
        console.log('Username từ publicKey:', recipientName);
        this.recipientName = recipientName;
      },
      (error) => {
        console.error('Lỗi khi lấy username từ publicKey:', error);
        this.recipientName = '';
      }
    );
  }

  openSendForm(): void {
    this.SendVisible = true;
  }

  showQRCode() {
    console.log('Địa chỉ ví:', this.walletInfo?.address);
    this.qrCodeVisible = true;
  }

  showSendForm() {
    this.SendVisible = true;
  }

  getWalletSecretKey() {
    this.apiService.getWalletSecret().subscribe(
      (secretKey: string) => {
        console.log(secretKey);
        this.secretKeyValue = secretKey;
        this.transactionForm.patchValue({ senderSecretKey: secretKey });
      },
      (error) => {
        console.error('Lỗi khi lấy secret key của ví:', error);
      }
    );
  }
  onSubmit() {
    if (this.transactionForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const { senderSecretKey, recipient, amount, message } = this.transactionForm.value;
    const adjustedAmount = amount/10000;
    this.apiService.sendTransaction(senderSecretKey, recipient, adjustedAmount, message).subscribe(
      (response) => {
        console.log('Transaction successful:', response);
        this.messageService.success('Giao dịch thành công!');
        this.apiService.getContacts(senderSecretKey).subscribe((contacts) => {
          console.log('Danh bạ:', contacts);
          const contactExists = contacts.some(contact =>
            contact.username === this.recipientName && contact.walletAddress === recipient
          );
          if (!contactExists) {
            setTimeout(() => {
              if (confirm(`Bạn có muốn lưu vào danh bạ không: ${this.recipientName} (${recipient})?`)) {
                const walletId = this.walletInfo?.address;
                const newContact: Contact = {
                  username: this.recipientName,
                  walletAddress: recipient,
                };
                this.apiService.addContact(senderSecretKey, newContact).subscribe(() => {
                  console.log('Contact added successfully:', newContact);
                }, error => {
                  console.error('Error adding contact:', error);
                });
              }
            }, 1000);
          } else {
            console.log('Liên hệ đã tồn tại, không thêm vào danh bạ.');
          }
        });
        this.transactionForm.reset();
        this.SendVisible = false;

      },
      (error) => {
        console.error('Transaction failed:', error);
        this.messageService.error('Giao dịch thất bại: ' + (error.error?.message || 'Lỗi không xác định.'));
      }
    );
  }




  addContact(publicKey: string, contact: Contact): void {
    this.apiService.addContact(publicKey, contact).subscribe(
      data => {
        console.log('Contact added successfully', data);
        this.messageService.success('Liên hệ đã được thêm vào danh bạ.');
      },
      error => {
        console.error('Error adding contact', error);
        this.messageService.error('Lỗi khi thêm liên hệ: ' + (error.error?.message || 'Lỗi không xác định.'));
      }
    );
  }


  closeSendForm(): void {
    this.SendVisible = false;
    this.transactionForm.reset();
    this.recipientName = '';
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

  closeQRCode() {
    this.qrCodeVisible = false;
  }

  async getWalletInfo() {
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
        console.log('Địa chỉ ví sau khi lấy từ API:', this.walletInfo.address);
      },
      (error) => {
        console.error('Error getting wallet info:', error);
        this.walletInfo = null;
      },
      () => {
        this.loading = false;
      }
    );
  }

  toggleSearch() {
    this.isSearchVisible = !this.isSearchVisible;
  }

  copyContent() {
    const content = document.getElementById('popover-content')?.innerText || '';
    navigator.clipboard.writeText(content).then(() => {
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 2000);
    }).catch(err => {
      console.error('Lỗi khi sao chép: ', err);
    });
  }
}
