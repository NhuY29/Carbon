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
@Component({
  selector: 'app-sample-sent',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSliderModule, NzInputNumberModule, NzGridModule],
  templateUrl: './sample-sent.component.html',
  styleUrls: ['./sample-sent.component.scss']
})
export class SampleSentComponent {
  showModal: boolean = false;
  selectedTrade: any;
  trades: TradeDTO[] = [];
  value1 = 1;
  totalPrice: number = 0;
  quantity: number = 1; // Biến để lưu giá trị số lượng
  currentImage: string = "";
  constructor(private tradeService: ApiService) { }
  showPurchaseModal: boolean = false;
  ngOnInit(): void {
    this.tradeService.getAllTrades().subscribe(
      (data) => {
        this.trades = data;
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách giao dịch:', error);
      }
    );
    this.calculateTotalPrice();
  }
  calculateTotalPrice() {
    this.totalPrice = this.selectedTrade.price * this.quantity;
  }
  resetQuantity() {
    this.quantity = 1; // Đặt lại giá trị quantity về mặc định
  }
  openModal(trade: any) {
    this.selectedTrade = trade;
    // Nếu không có hình ảnh nào, dùng `currentImage` mặc định
    this.currentImage = trade.imageUrls && trade.imageUrls.length > 0
      ? `http://localhost:8080/image/get-by-url?imageUrl=${trade.imageUrls[0]}&width=500&height=500`
      : this.currentImage;

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetQuantity(); 
  }
  increaseQuantity() {
    if (this.quantity < 1000) {
      this.quantity++;
      this.calculateTotalPrice();
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
      this.calculateTotalPrice();
    }
  }

  onModalClick(event: MouseEvent) {
    // Ngăn chặn sự kiện click từ việc propagating lên overlay
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
    this.selectedTrade = trade; // Lưu thông tin giao dịch
    this.currentImage = trade.imageUrls && trade.imageUrls.length > 0
      ? `http://localhost:8080/image/get-by-url?imageUrl=${trade.imageUrls[0]}&width=150&height=150`
      : this.currentImage;
    this.showPurchaseModal = true; // Hiện thị modal mua hàng
  }

  closePurchaseModal() {
    this.showPurchaseModal = false; // Đóng modal mua hàng
    this.resetQuantity(); 
  }
  updateCurrentImage(imageUrl: string) {
    this.currentImage = `http://localhost:8080/image/get-by-url?imageUrl=${imageUrl}&width=500&height=500`;
  }
}