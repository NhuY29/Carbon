import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { TradeDTO } from '../sample-sent/tradeDTO';
import { CartDTO } from './cart.dto';
import { WalletResponse } from '../wallet/WalletResponse';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSliderModule, NzInputNumberModule, NzGridModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  host: { 'ngSkipHydration': '' }
})
export class CartComponent {
  @Input() cartItems: CartDTO[] = [];
  amount: number = 0;

  selectedTrade: any;
  trades: TradeDTO[] = [];
  currentUserId: string | null = null;
  constructor(private tradeService: ApiService, private message: NzMessageService, private modal: NzModalService) { }
  showPurchaseModal: boolean = false;

  ngOnInit(): void {
    this.loadCartItems();
    this.tradeService.getUserIdFromToken().subscribe(userId => {
      this.currentUserId = userId;
    }, error => {
      console.error('Error fetching user ID:', error);
    });
  
    this.tradeService.getAllTrades().subscribe(
      (data) => {
        this.trades = data;
        if (this.trades.length > 0) {
          this.selectedTrade = this.trades[0];
          this.loadCartItems();
        }
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách giao dịch:', error);
      }
    );
  }
  logAmount(item: CartDTO) {
    const balance = Number(item.balance) / 1000000000; // Đảm bảo tỷ lệ đúng với đơn vị
    const amount = Number(item.amount);
    console.log(`Số lượng hiện tại cho ${item.projectName}: ${item.amount}: ${balance}`);
    if (!isNaN(balance) && !isNaN(amount) && amount > balance) {
      this.message.error(`Sản phẩm ${item.projectName} hết hàng. Số lượng yêu cầu: ${amount}, số lượng còn lại: ${balance}.`);
      item.amount = 0; // Đặt lại số lượng thành 1 nếu lớn hơn số dư
    }
  }
  loadCartItems(): void {
    if (this.currentUserId) {
      this.tradeService.getAllCartItemsByUserId(this.currentUserId).subscribe({
        next: (items) => {
          this.cartItems = items;
  
          this.cartItems.forEach(item => {
            this.tradeService.getTokenBalance(item.mintToken, item.tokenAddress).subscribe({
              next: (balanceResponse) => {
                item.balance = balanceResponse.balance;
  
                const balanceNumber = Number(item.balance);
                if (!isNaN(balanceNumber)) {
                  const adjustedBalance = balanceNumber / 1000000000; 
                  console.log(`Tên dự án: ${item.projectName}, Số lượng còn lại: ${adjustedBalance}, Số lượng trong giỏ: ${item.amount}`);
                  
                  // Kiểm tra ngay sau khi tải các mục trong giỏ hàng
                  this.logAmount(item);
                } else {
                  console.error(`Giá trị không hợp lệ cho balance: ${item.balance}`);
                }
              },
              error: (error) => {
                console.error(`Lỗi khi lấy số dư cho ${item.projectName}:`, error);
              }
            });
          });
        },
        error: (err) => {
          console.error('Lỗi khi lấy danh sách giỏ hàng:', err);
        }
      });
    }
  }

  onItemCheck(item: any, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    item.checked = isChecked;
    if (isChecked) {
      console.log(`Checked item: ${item.projectName}`);
    } else {
      console.log(`Unchecked item: ${item.projectName}`);
    }
  }
  calculateTotal() {
    let total = 0;
    this.cartItems.forEach(item => {
      if (item.checked) {
        total += item.price * item.amount;
      }
    });
    return total;
  }


  getFirstImageUrl(imageUrls: string[]): string {
    const firstImageUrl = imageUrls && imageUrls.length > 0
      ? 'http://localhost:8080/image/get-by-url?imageUrl=' + imageUrls[0] + '&width=50&height=50'
      : 'http://localhost:8080/image/default-image.jpg';

    return firstImageUrl;
  }
  deleteCartItem(cartId: string): void {
    if (!cartId) {
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận',
      nzContent: 'Bạn có chắc chắn muốn xóa mục này khỏi giỏ hàng?',
      nzOnOk: () => {
        this.tradeService.deleteCartItem(cartId).subscribe({
          next: () => {
            this.message.success('Đã xóa mục khỏi giỏ hàng thành công');
            this.loadCartItems();
          },
          error: (err) => {
            this.message.error('Lỗi khi xóa mục khỏi giỏ hàng');
            console.error('Lỗi khi xóa mục:', err);
          }
        });
      }
    });
  }
  processPayment(cart: CartDTO): void {
    if (!cart) {
      console.error('Không có giao dịch nào được chọn!');
      return;
    }

    const userId = cart.userId;
    const mintToken = cart.mintToken;
    const amount = cart.amount;
    const solAmount = (cart.price * amount) / 10000;
    console.log(amount);
    this.tradeService.getWalletSecret().subscribe(
      (receiverSecretKeyBase58) => {
        console.log('Receiver secret key:', receiverSecretKeyBase58);

        this.tradeService.getWalletInfo().subscribe(
          (walletInfo) => {
            console.log('Wallet Info:', walletInfo);

            this.tradeService.getWalletByUserId(userId).subscribe(
              (walletResponse: WalletResponse) => {
                console.log('User Wallet Info:', walletResponse);
                this.onTransfer(
                  walletResponse.secretKey,
                  walletInfo.address,
                  mintToken,
                  amount,
                  solAmount,
                  receiverSecretKeyBase58
                );
              },
              (error) => {
                console.error('Lỗi khi lấy thông tin ví từ userId:', error);
              }
            );
          },
          (error) => {
            console.error('Lỗi khi lấy thông tin ví từ token:', error);
          }
        );
      },
      (error) => {
        console.error('Lỗi khi lấy secret key:', error);
      }
    );
  }


  onTransfer(
    senderSecretKeyBase58: string,
    toAddressBase58: string,
    mintAddressBase58: string,
    amount: number,
    solAmount: number,
    receiverSecretKeyBase58?: string
  ) {

    if (!senderSecretKeyBase58 || !toAddressBase58 || !mintAddressBase58 || amount <= 0 || solAmount < 0) {
      this.message.error('Thông tin tham số không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    this.tradeService.transferToken(
      senderSecretKeyBase58,
      toAddressBase58,
      mintAddressBase58,
      amount,
      solAmount,
      receiverSecretKeyBase58 || ''
    ).subscribe(response => {
      console.log('Transfer response:', response);

      if (response.success) {
        this.message.success(response.message);
      } else {
        this.message.error(response.message);
      }
    }, error => {
      console.error('API call error:', error);
      this.message.error('Có lỗi xảy ra khi gọi API.');
    });
  }
  processAllPayments(): void {
    if (this.cartItems.every(item => !item.checked)) {
      this.message.warning('Vui lòng chọn sản phẩm để thanh toán.');
      return;
    }

    const totalAmount = this.calculateTotal();

    this.tradeService.getWalletInfo().subscribe(
      walletInfo => {
        const userBalance = walletInfo.balance;
        console.log('Số dư người dùng:', userBalance);
        console.log('Tổng tiền cần thanh toán:', totalAmount);

        if (userBalance < totalAmount) {
          this.message.error('Số dư trong ví không đủ để thanh toán.');
          return;
        }
        this.modal.confirm({
          nzTitle: 'Xác nhận thanh toán',
          nzContent: `<p>Bạn có chắc chắn muốn thanh toán tổng số tiền là <strong>${totalAmount} VND</strong> không?</p>`,
          nzOnOk: () => {
            this.cartItems.forEach(item => {
              if (item.checked) {
                this.processPayment(item);
              }
            });
            this.message.success('Thanh toán thành công!');
          },
          nzOnCancel: () => {
            this.message.info('Hủy thanh toán.');
          }
        });
      },
      error => {
        this.message.error('Không thể lấy số dư người dùng.');
      }
    );
  }

}
