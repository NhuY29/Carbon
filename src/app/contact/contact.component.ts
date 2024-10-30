
import { Contact } from './contact.modal';
import { Input, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, EventEmitter, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [AppTranslateModule,CommonModule, FormsModule, NzInputModule, NzFormModule, NzButtonModule, NzListModule, NzIconModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  @Output() contactSelected = new EventEmitter<Contact>();
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  newContact: Contact = { contactId: '', username: '', walletAddress: '' };
  searchTerm: string = '';
  searchIcon = 'search';
  isWalletActive: boolean = true;
  @Input() senderSecretKey: string = '';
  constructor(public translate: TranslateService,private contactService: ApiService, private messageService: NzMessageService, private modalService: NzModalService) { 
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
    this.loadContacts(this.senderSecretKey);
  }
  confirmDeleteContact(contact: Contact): void {
    this.modalService.confirm({
        nzTitle: 'Bạn có chắc chắn muốn xóa liên hệ này?',
        nzContent: `<b style="color: red;">Hành động này không thể hoàn tác!</b>`,
        nzOnOk: () => {
            if (contact.contactId) {
                this.deleteContact(contact.contactId);
            } else {
                this.messageService.error('ID liên hệ không hợp lệ.');
            }
        }
    });
}
  private longPressTimer: any;
  private longPressDuration: number = 500; 
  private longPressedContact: Contact | null = null; // Thêm biến để lưu thông tin liên hệ đã nhấn lâu
  
  startLongPress(contact: Contact): void {
    this.longPressedContact = contact; // Lưu thông tin liên hệ đã nhấn lâu
    this.longPressTimer = setTimeout(() => {
      if (this.longPressedContact) {
        this.confirmDeleteContact(this.longPressedContact); // Gọi hàm xác nhận xóa
      }
    }, this.longPressDuration);
  }
  
  endLongPress(): void {
    clearTimeout(this.longPressTimer); // Xóa timer nếu nhấn không đủ lâu
    this.longPressedContact = null; // Đặt lại biến khi nhấn không đủ lâu
  }
  

  loadContacts(secretKey: string): void {
    this.contactService.getContacts(secretKey).subscribe(
      data => {
        this.contacts = data;
        this.filteredContacts = data;
        console.log('Contacts loaded:', this.contacts);
      },
      error => {
        console.error('Error fetching contacts', error);
      }
    );
  }


  addContact(publicKey: string, contact: Contact): void {
    this.contactService.addContact(publicKey, contact).subscribe(
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


  deleteContact(id: string): void {
    this.contactService.deleteContact(id).subscribe(
      () => {
        // Xóa liên hệ khỏi danh sách
        this.contacts = this.contacts.filter(c => c.contactId !== id);
        this.filteredContacts = this.filteredContacts.filter(c => c.contactId !== id);
        // Hiển thị thông báo thành công
        this.messageService.success('Liên hệ đã được xóa thành công.');
      },
      error => {
        console.error('Error deleting contact', error);
        // Hiển thị thông báo lỗi
        this.messageService.error('Lỗi khi xóa liên hệ: ' + (error.error?.message || 'Lỗi không xác định.'));
      }
    );
}

  searchContacts(term: string): void {
    if (!term) {
      this.filteredContacts = this.contacts;
    } else {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.username.toLowerCase().includes(term.toLowerCase())
      );
    }
  }
  onSelectContact(contact: Contact): void {
    console.log('Selected contact:', contact);
    this.contactSelected.emit(contact);
  }

}
