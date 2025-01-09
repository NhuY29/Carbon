import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TradeDTO } from '../sample-sent/tradeDTO';
import { ApiService } from '../../api.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ProjectDTO } from '../ProjectDTO';
import { ProjectOfTrade2 } from './ProjectOfTrade2';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
@Component({
  selector: 'app-my-trading-list',
  standalone: true,
  imports: [NzDividerModule, NzFormModule, NzSelectModule, NzModalModule, AppTranslateModule, NzIconModule, NzTypographyModule, NzCardModule, FormsModule, NzInputModule, NzMessageModule, NzButtonModule, CommonModule, NzEmptyModule, NzTagModule, NzTableModule],
  templateUrl: './my-trading-list.component.html',
  styleUrls: ['./my-trading-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MyTradingListComponent implements OnInit {
  projects: ProjectOfTrade2[] = [];
  walletAddress: string | null = null;
  trades: TradeDTO[] = [];
  modalRef: any;
  userId: string | null = null;
  pageIndex: number = 1;
  pageSize: number = 5;
  isWalletActive: boolean = true;
  updatedPrice: number = 0;
  updatedApprovalStatus: string = '';
  updatedQuantity: number = 0;
  isModalVisible: boolean = false;
  tradeToUpdate: any = null;
  updatedStatus: string = '';
  publicKey: string = '';
  mintAddress: string = '';
  tokenInfo: any = null;
  currentUserId: string | null = null;
  mintProjectId: string | null = null;
  selectedProjectId: string | null = null;
  isVisible: boolean = false;
  totalQuantity: number = 0;
  remainingQuantity: number = 0;
  statusOptions = [
    { value: 'true', label: 'Còn hàng' },
    { value: 'false', label: 'Đã bán hết' },
  ];
  balance: string = '0';

  @ViewChild('updateTradeTemplate', { static: true }) updateTradeTemplate!: TemplateRef<any>;
  @ViewChild('addTradeTemplate', { static: true }) addTradeTemplate!: TemplateRef<any>;
  approvalStatuses = [
    { value: 'CHOXULY', label: 'Chờ xử lý' },
    { value: 'DAXULY', label: 'Đã xử lý' }
  ];
  newTrade = {
    buyerUserId: '',
    projectId: '',
    quantity: '',
    mintToken: '',
    tokenAddress: '',
    price: '',
    purchasedFrom: '',
    purchasePrice: '',
    balance: ''
  };

  constructor(
    private message: NzMessageService,
    private modalService: NzModalService,
    private tradeService: ApiService,
    public translate: TranslateService
  ) {
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');
    const savedState = localStorage.getItem('isWalletActive');
    this.isWalletActive = savedState === 'true';
    console.log(`Initial wallet state: ${this.isWalletActive ? 'ACTIVE' : 'INACTIVE'}`);
    this.translate.use(this.isWalletActive ? 'vi' : 'en');
  }
  handleOk(): void {
    if (this.updatedPrice > 0) {
      this.updateTradeApproval(
        this.tradeToUpdate.tradeId,
        this.updatedPrice,
        this.updatedApprovalStatus,
        this.updatedQuantity,
        this.updatedStatus
      );
      this.isModalVisible = false;
    } else {
      this.message.error('Giá mới không hợp lệ. Vui lòng nhập giá lớn hơn 0.');
    }
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  addTrade() {
    if (!this.selectedProjectId) {
      this.message.warning('Vui lòng chọn một dự án trước khi thêm giao dịch!');
      return;
    }
  
    const selectedProject = this.projects.find(project => project.value === this.selectedProjectId);
    
    if (!selectedProject) {
      this.message.warning('Dự án không hợp lệ!');
      return;
    }
  

    this.newTrade.projectId =selectedProject.projectId;  
    this.newTrade.mintToken = selectedProject.value;  
  
    this.newTrade.buyerUserId = this.userId || '';
    this.newTrade.purchasedFrom = this.newTrade.purchasedFrom || '';
    this.newTrade.purchasePrice = this.newTrade.purchasePrice || '0';
    this.newTrade.quantity = this.newTrade.quantity || '0';

    this.tradeService.createTrade(this.newTrade).subscribe(
      response => {
        console.log('Giao dịch đã được thêm thành công:', response);
        this.message.success('Giao dịch đã được thêm thành công!');
        this.resetForm();
        this.loadTrades();
        this.modalRef.destroy();
      },
      error => {
        console.error('Đã xảy ra lỗi khi thêm giao dịch:', error);
        this.message.error('Đã xảy ra lỗi khi thêm giao dịch.');
      }
    );
  }
  
  


  handleCancelAdd(): void {
    this.resetForm();
  }
  resetForm(): void {
  }

  onMintProjectChange() {
    if (this.mintProjectId) {
      const selectedProject = this.projects.find(project => project.value === this.mintProjectId);

      if (selectedProject) {
        this.newTrade.mintToken = selectedProject.value;
        this.newTrade.projectId = selectedProject.projectId;
        console.log("Selected Mint Token: ", this.newTrade.mintToken);
        console.log("Selected Project ID: ", this.newTrade.projectId);
      }
    }
  }


  onProjectChange(selectedProjectId: string): void {
    if (!selectedProjectId) {
      console.error('Vui lòng chọn dự án');
      return;
    }

    this.selectedProjectId = selectedProjectId;

    this.tradeService.getWalletInfo().subscribe(
      (response) => {
        console.log('Thông tin ví:', response);

        if (response && response.address) {
          this.walletAddress = response.address;
          console.log('Địa chỉ ví:', this.walletAddress);

          if (!this.walletAddress) {
            console.error('Địa chỉ ví không hợp lệ');
            this.message.error('Địa chỉ ví không hợp lệ');
            return;
          }

          const selectedProject = this.projects.find(project => project.value === this.selectedProjectId);

          if (selectedProject) {
            const mintAddress = selectedProject.value;

            if (!mintAddress) {
              console.error('Mint Address không hợp lệ');
              this.message.error('Mint Address không hợp lệ');
              return;
            }
            console.log('Selected Mint Token:', mintAddress);

            this.newTrade.mintToken = mintAddress;

            this.tradeService.getTokenAddress(this.walletAddress, mintAddress).subscribe(
              (tokenResponse) => {
                console.log('Thông tin token:', tokenResponse);
                const newTokenAddress = tokenResponse.tokenAddress;
                console.log('Token Address:', newTokenAddress);

                this.newTrade.tokenAddress = newTokenAddress;
                this.tradeService.getTokenBalance(mintAddress, newTokenAddress).subscribe(
                  (balanceResponse) => {
                    console.log(`Số dư token cho mintAddress ${mintAddress}:`, balanceResponse.balance);
                    this.newTrade.balance = (parseFloat(balanceResponse.balance) / 1000000000).toString();
                    console.log('Số dư token đã cập nhật:', this.newTrade.balance);

                    this.loadTrades();
                  },
                  (error) => {
                    console.error('Lỗi khi lấy số dư token:', error);
                    this.message.error('Lỗi khi lấy số dư token.');
                  }
                );
              },
              (error) => {
                console.error('Lỗi khi gọi API getTokenAddress:', error);
                this.message.error('Lỗi khi gọi API getTokenAddress.');
              }
            );
          } else {
            console.error('Dự án không tồn tại!');
            this.message.error('Dự án không tồn tại!');
          }
        } else {
          console.error('Không có địa chỉ ví trong phản hồi.');
          this.message.error('Không có địa chỉ ví trong phản hồi.');
        }
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin ví:', error);
        this.message.error('Lỗi khi lấy thông tin ví.');
      }
    );
  }


  openUpdateModal(trade: TradeDTO): void {
    this.tradeToUpdate = trade;
    this.updatedPrice = trade.price;
    this.updatedApprovalStatus = trade.approvalStatus;
    this.updatedQuantity = trade.quantity;
    this.updatedStatus = (trade.status === "true") ? 'true' : 'false';
    this.balance = trade.balance || '0';
    this.modalService.create({
      nzTitle: 'Cập nhật bài đăng',
      nzContent: this.updateTradeTemplate,
      nzOnOk: () => this.handleOk(),
      nzOnCancel: () => this.handleCancel()
    });
  }

  openAddTradeModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Thêm giao dịch',
      nzContent: this.addTradeTemplate,
      nzFooter: null,
      nzOnCancel: () => this.resetForm()
    });

    this.modalRef = modalRef;
  }
  increaseQuantity(): void {
    const maxQuantity = (this.tradeToUpdate.approvalStatus === 'DAXULY')
      ? this.remainingQuantity + this.tradeToUpdate.quantity
      : this.remainingQuantity;

    console.log("Max quantity: ", maxQuantity);

    if (this.updatedQuantity < maxQuantity) {
      this.updatedQuantity++;
    } else {
      this.message.warning('Số lượng không thể vượt quá số lượng còn lại cộng với giá trị của giao dịch.');
    }
  }
  decreaseQuantity(): void {
    if (this.updatedQuantity > 0) {
      this.updatedQuantity--;
    }
  }
  onQuantityChange(value: number): void {
    const maxQuantity = (this.tradeToUpdate.approvalStatus === 'DAXULY')
      ? this.remainingQuantity + this.tradeToUpdate.quantity
      : this.remainingQuantity;

    if (value > maxQuantity) {
      this.updatedQuantity = maxQuantity;
      this.message.warning('Số lượng không thể vượt quá số lượng còn lại cộng với giá trị của giao dịch.');
    } else if (value < 0) {
      this.updatedQuantity = 0;
      this.message.warning('Số lượng không thể nhỏ hơn 0.');
    }
    else {
      this.updatedQuantity = value;
    }
  }


  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadTrades();
  }
  ngOnInit(): void {
    this.tradeService.getUserIdFromToken().subscribe(
      (userId) => {
        this.currentUserId = userId;
        this.userId = userId;
        this.newTrade.buyerUserId = this.userId;
        this.loadTrades();
        this.getWalletInfo();
        this.loadProjects(userId);
      },
      (error) => {
        console.error('Có lỗi khi lấy userId từ token', error);
        this.message.error('Lỗi khi lấy thông tin người dùng.');
      }
    );
    this.tradeService.getUserIdFromToken().subscribe(
      (userId) => {
        this.userId = userId;
        this.loadTrades();
        this.getWalletInfo();
        this.loadProjects(userId);
      },
      (error) => {
        console.error('Có lỗi khi lấy userId từ token', error);
        this.message.error('Lỗi khi lấy thông tin người dùng.');
      }
    );
  }
  loadProjects(userId: string): void {
    this.tradeService.getProjectsOfTradeByUserId(userId).subscribe(
      (data) => {
        this.projects = data;
      },
      (error) => {
        console.error('Lỗi khi tải danh sách dự án:', error);
        this.message.error('Lỗi khi tải danh sách dự án.');
      }
    );
  }
  loadTrades(): void {
    if (!this.userId) {
      console.error('Không có userId để tải giao dịch');
      this.message.error('Không có userId để tải giao dịch');
      return;
    }

    if (!this.selectedProjectId) {
      return;
    }

    console.log('Selected Project ID:', this.selectedProjectId);

    this.tradeService.getTradesByUserIdAndMintToken(this.userId, this.selectedProjectId).subscribe(
      (data) => {
        this.trades = data;
        console.log(this.trades);

        this.totalQuantity = 0;

        this.trades.forEach(trade => {
          if (trade.approvalStatus === 'DAXULY') {
            if (!trade.tokenAddress) {
              this.publicKey = this.walletAddress!;
              this.mintAddress = trade.mintToken;
              console.log(`TokenAddress rỗng. Lấy mintToken: ${this.mintAddress} và PublicKey: ${this.publicKey}`);
              this.tradeService.getTokenAddress(this.publicKey, this.mintAddress).subscribe(
                (response) => {
                  console.log('Địa chỉ token:', response);
                  const newTokenAddress = response.tokenAddress;
                  this.tradeService.updateTradeTokenAddress(trade.tradeId, newTokenAddress).subscribe(
                    (updateResponse) => {
                      console.log('Cập nhật tokenAddress thành công:', updateResponse);
                      trade.tokenAddress = newTokenAddress;
                    },
                    (updateError) => {
                      console.error('Lỗi khi cập nhật tokenAddress:', updateError);
                      this.message.error('Lỗi khi cập nhật tokenAddress.');
                    }
                  );
                },
                (error) => {
                  console.error('Lỗi khi gọi API getTokenAddress:', error);
                  this.message.error('Lỗi khi gọi API getTokenAddress.');
                }
              );
            } else {
              this.getTokenBalance(trade.mintToken, trade.tokenAddress, trade);
            }

            const quantity = trade.quantity;
            if (!isNaN(quantity)) {
              this.totalQuantity += quantity;
            } else {
              console.error('Số lượng không hợp lệ:', trade.quantity);
            }
          }
        });

      },
      (error) => {
        console.error('Lỗi khi tải danh sách giao dịch:', error);
        this.message.error('Lỗi khi tải danh sách giao dịch.');
      }
    );
  }
  calculateRemainingQuantity(balance: string | undefined, totalQuantity: number): number {
    if (!balance || isNaN(Number(balance))) {
      return 0;
    }

    const balanceNumber = parseFloat(balance);
    const remainingQuantity = balanceNumber - totalQuantity;
    this.remainingQuantity = remainingQuantity;
    return remainingQuantity;
  }
  getWalletInfo(): void {
    this.tradeService.getWalletInfo().subscribe(
      (response) => {
        console.log('Thông tin ví:', response);
        if (response && response.address) {
          this.walletAddress = response.address;
          console.log('Địa chỉ ví:', this.walletAddress);
          this.loadTrades();
        } else {
          console.error('Không có địa chỉ ví trong phản hồi.');
          this.message.error('Không có địa chỉ ví trong phản hồi.');
        }
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin ví:', error);
        this.message.error('Lỗi khi lấy thông tin ví.');
      }
    );
  }


  getTokenBalance(mintAddress: string, tokenAccountAddress: string, trade: TradeDTO): void {
    this.tradeService.getTokenBalance(mintAddress, tokenAccountAddress).subscribe(
      (response) => {
        console.log(`Số dư token cho mintAddress ${mintAddress}:`, response.balance);
        trade.balance = (parseFloat(response.balance) / 1000000000).toString();

      },
      (error) => {
        console.error('Lỗi khi lấy số dư token:', error);
        this.message.error('Lỗi khi lấy số dư token.');
      }
    );
  }

  updateTradeApproval(
    tradeId: string,
    newPrice: number,
    newApprovalStatus: string,
    newQuantity: number,
    newStatus: string
  ): void {

    if (newApprovalStatus === 'CHOXULY') {
      newQuantity = 0;
    }

    const maxQuantity = this.remainingQuantity + this.tradeToUpdate.quantity;

    if (newQuantity < 0 || newQuantity > maxQuantity) {
      this.message.warning('Số lượng phải lớn hơn 0 và nhỏ hơn hoặc bằng ' + maxQuantity);
      return;
    }

    this.tradeService
      .updateTradeApproval(tradeId, newPrice, newApprovalStatus, newQuantity, newStatus)
      .subscribe(
        (response) => {
          console.log('Trade updated successfully:', response);
          this.message.success('Cập nhật giao dịch thành công!');
          this.loadTrades();
        },
        (error) => {
          console.error('Lỗi khi cập nhật giao dịch:', error);
          this.message.error('Lỗi khi cập nhật giao dịch!');
        }
      );
  }


  deleteTrade(tradeId: string): void {
    this.modalService.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa trade này không?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Xóa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.tradeService.deleteTrade(tradeId).subscribe(
          () => {
            this.message.success('Trade đã được xóa thành công');
            this.loadTrades();
          },
          () => {
            this.message.error('Có lỗi xảy ra khi xóa trade');
          }
        );
      }
    });
  }

}
