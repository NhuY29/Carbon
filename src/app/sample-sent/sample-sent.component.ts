import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { TradeDTO } from './tradeDTO';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { WalletResponse } from '../wallet/WalletResponse';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CartDTO } from '../cart/cart.dto';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
import { TradeRequest } from './TradeRequest ';
import { SolanaService } from '../../solanaApi.service';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'app-sample-sent',
  standalone: true,
  imports: [NzProgressModule, AppTranslateModule, CommonModule, FormsModule, NzSliderModule, NzInputNumberModule, NzGridModule],
  templateUrl: './sample-sent.component.html',
  styleUrls: ['./sample-sent.component.scss'],
  host: { 'ngSkipHydration': '' }
})
export class SampleSentComponent {
  public tokenAddress: string = "";
  showModal: boolean = false;
  selectedTrade: any;
  trades: TradeDTO[] = [];
  value1 = 1;
  totalPrice: number = 0;
  quantity: number = 0;
  currentImage: string = "";
  remainingQuantity: number = 0;
  cartItems: CartDTO[] = [];
  currentUserId: string | null = null;
  cartItemCount: number = 0;
  isWalletActive: boolean = true;
  selectedTransaction: any = null;
  progressPercent = 0;
  constructor(private solanaServiec: SolanaService, public translate: TranslateService, private tradeService: ApiService, private message: NzMessageService, private modal: NzModalService) {
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
  showPurchaseModal: boolean = false;
  ngOnInit(): void {
    this.tradeService.getUserIdFromToken().subscribe(userId => {
      this.currentUserId = userId;
      this.loadCartItems(userId);
    }, error => {
      console.error('Error fetching user ID:', error);
    });
    this.tradeService.getAllTrades().subscribe(
      (data) => {
        this.trades = data;
        if (this.trades.length > 0) {
          this.selectedTrade = this.trades[0];
        }
        this.checkAllTradesBalance();
        console.log('Danh sách giao dịch:', this.trades);
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách giao dịch:', error);
      }
    );
    this.calculateTotalPrice();
  }
  checkAllTradesBalance() {
    this.trades.forEach(trade => {
      const mintAddress = trade.mintToken;
      const tokenAccountAddress = trade.tokenAddress;

      if (tokenAccountAddress) {
        const quantity = trade.quantity;
        console.log('Số lượng còn lại:', quantity);
        if (quantity <= 0) {
          this.tradeService.deactivateTrade(trade.tradeId).subscribe(() => {
            console.log(`Giao dịch ${trade.tradeId} đã được vô hiệu hóa.`);
          }, error => {
            this.message.error(`Không thể vô hiệu hóa giao dịch ${trade.tradeId}.`);
          });
        }
      }
    });
  }

  calculateTotalPrice() {
    if (this.quantity > this.selectedTrade?.quantity) {
      this.quantity = this.selectedTrade?.quantity;
    }
    this.totalPrice = this.selectedTrade ? this.selectedTrade.price * this.quantity : 0;
  }

  loadCartItems(userId: string): void {
    this.tradeService.getAllCartItemsByUserId(userId).subscribe(
      (cartItems: CartDTO[]) => {
        this.cartItems = cartItems;
        this.updateCartItemCount();
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu giỏ hàng:', error);
      }
    );
  }
  updateCartItemCount() {
    this.cartItemCount = this.cartItems.length;
  }

  resetQuantity() {
    this.quantity = 0;
  }
  openModal(trade: any) {
    this.selectedTrade = trade;
    this.currentImage = trade.imageUrls && trade.imageUrls.length > 0
      ? `http://localhost:8080/image/get-by-url?imageUrl=${trade.imageUrls[0]}&width=500&height=500`
      : this.currentImage;

    this.showModal = true;
    this.checkTokenBalance();
  }

  closeModal() {
    this.showModal = false;
    this.resetQuantity();
  }
  increaseQuantity() {
    if (this.quantity < this.selectedTrade?.quantity) {
      this.quantity++;
      this.calculateTotalPrice();
    }
  }

  decreaseQuantity() {
    if (this.quantity > 0) {
      this.quantity--;
      this.calculateTotalPrice();
    }
  }

  onModalClick(event: MouseEvent) {
    event.stopPropagation();

  }
  getImageSrc(imageUrl: string, width: number, height: number): Observable<string> {
    return new Observable<string>((observer) => {
      this.tradeService.getImageByUrl(imageUrl, width, height).subscribe(
        (blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            observer.next(reader.result as string);
            observer.complete();
          };
          reader.readAsDataURL(blob);
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }
  buyNow(trade: any) {
    this.selectedTrade = trade;
    this.currentImage = trade.imageUrls && trade.imageUrls.length > 0
      ? `http://localhost:8080/image/get-by-url?imageUrl=${trade.imageUrls[0]}&width=150&height=150`
      : this.currentImage;
    this.showPurchaseModal = true;
    this.checkTokenBalance();
  }

  closePurchaseModal() {
    this.showPurchaseModal = false;
    this.resetQuantity();
  }
  updateCurrentImage(imageUrl: string) {
    this.currentImage = `http://localhost:8080/image/get-by-url?imageUrl=${imageUrl}&width=500&height=500`;
  }
  updateRemainingQuantity(tradeId: string, remainingQuantity: number) {
    console.log(`Cập nhật số lượng còn lại cho giao dịch ${tradeId}: ${remainingQuantity}`);

    this.tradeService.updateTradeQuantity(tradeId, remainingQuantity).subscribe(
      () => {
          this.tradeService.getAllTrades().subscribe(
      (data) => {
        this.trades = data;
        if (this.trades.length > 0) {
          this.selectedTrade = this.trades[0];
        }
        this.checkAllTradesBalance();
        console.log('Danh sách giao dịch:', this.trades);
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách giao dịch:', error);
      }
    );
        console.log('Cập nhật số lượng còn lại thành công!');
      },
      (error) => {
        console.error('Lỗi khi cập nhật số lượng còn lại:', error);
        this.message.error('Không thể cập nhật số lượng còn lại. Vui lòng thử lại.');
      }
    );
  }

  processPayment(trade: TradeDTO) {
    if (!trade) {
      console.error('Không có giao dịch nào được chọn!');
      return;
    }

    const userId = trade.userId;
    const mintToken = trade.mintToken;
    const amount = this.quantity;
    const solAmount = this.totalPrice / 10000;
    const Quantity = trade.quantity;
    console.log('Số lượng còn lại:', Quantity);
    const remainingQuantityAfterPurchase = Quantity - amount;

    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn thực hiện giao dịch này không?',
      nzOkText: 'Xác nhận',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.tradeService.getWalletSecret().subscribe(
          (receiverSecretKeyBase58) => {
            this.tradeService.getWalletInfo().subscribe(
              (walletInfo) => {
                this.tradeService.getWalletByUserId(userId).subscribe(
                  (walletResponse: WalletResponse) => {
                    this.onTransfer(walletResponse.secretKey, walletInfo.address, mintToken, amount, solAmount, receiverSecretKeyBase58);
                    const tradeRequest: TradeRequest = {
                      buyerUserId: this.currentUserId !== null ? this.currentUserId : '',
                      projectId: trade.projectId,
                      quantity: amount,
                      mintToken: mintToken,
                      tokenAddress: "",
                      price: "",
                      purchasedFrom: trade.userId,
                      purchasePrice: trade.price,
                    };
                    this.tradeService.createTrade(tradeRequest).subscribe(
                      (createdTrade) => {
                        console.log('Giao dịch đã được tạo:', createdTrade);
                        this.updateRemainingQuantity(trade.tradeId, remainingQuantityAfterPurchase);
                      },
                      (error) => {
                        console.error('Lỗi khi tạo giao dịch:', error);
                      }
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
        this.showModal = false;
      }
    });
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

    this.tradeService.transferToken(senderSecretKeyBase58, toAddressBase58, mintAddressBase58, amount, solAmount, receiverSecretKeyBase58 || '')
      .subscribe(response => {
        if (response.success) {
          const signature = response.signature;
          console.log('Chữ ký giao dịch:', signature);

          this.tokenAddress = signature;

          this.message.success(response.message);
          this.closePurchaseModal();
        } else {
          this.message.error(response.message);
          this.closePurchaseModal();
        }
      }, error => {
        this.message.error('Có lỗi xảy ra khi gọi API.');
        this.closePurchaseModal();
      });
  }



  checkTokenBalance() {
    if (!this.selectedTrade) {
      this.message.error('Chưa chọn giao dịch nào.');
      return;
    }

    const mintAddress = this.selectedTrade.mintToken;
    const tokenAccountAddress = this.selectedTrade.tokenAddress;

    if (!tokenAccountAddress) {
      this.message.error('Địa chỉ tài khoản token không tồn tại.');
      return;
    }

    this.tradeService.getTokenBalance(mintAddress, tokenAccountAddress).subscribe(
      (response) => {
        const balance = response.balance;
        const balanceInBillion = parseFloat(balance) / 1000000000;
        this.remainingQuantity = balanceInBillion;
      },
      (error) => {
        console.error('Lỗi khi lấy số dư token:', error);
        this.message.error('Không thể lấy số dư token.');
      }
    );
  }
  addToCart(): void {
    const userId = this.currentUserId;
    const tradeId = this.selectedTrade ? this.selectedTrade.tradeId : undefined;
    const amount = this.quantity;

    if (!userId || !tradeId || !amount) {
      this.message.error('Vui lòng kiểm tra thông tin giỏ hàng.');
      return;
    }

    this.tradeService.addToCart(userId, tradeId, amount).subscribe(
      response => {
        this.message.success('Thêm vào giỏ hàng thành công!');
        this.closePurchaseModal();
        setTimeout(() => {
          this.loadCartItems(userId);
        }, 4000);
      },
      error => {
        this.message.error('Có lỗi xảy ra khi thêm vào giỏ hàng.');
        console.error('Lỗi:', error);
      }
    );
  }

}
