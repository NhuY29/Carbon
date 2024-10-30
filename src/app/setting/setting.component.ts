import { Component } from '@angular/core';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
import { SharedService } from '../shared-service.service';
@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [AppTranslateModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent {
  isWalletActive: boolean;

  constructor(
    private sharedService: SharedService,
    public translate: TranslateService
  ) {
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');
    const savedState = localStorage.getItem('isWalletActive');
    this.isWalletActive = savedState === 'false'; 
    console.log(`Initial airdrop state: ${this.isWalletActive ? 'ACTIVE' : 'INACTIVE'}`);
  }

  toggle(): void {
    this.isWalletActive = !this.isWalletActive;
    console.log(`airdrop state toggled: ${this.isWalletActive ? 'ACTIVE' : 'INACTIVE'}`);
    localStorage.setItem('isWalletActive', String(this.isWalletActive));
    this.sharedService.updateState(this.isWalletActive);
    const language = this.isWalletActive ? 'vi' : 'en';
    this.translate.use(language);
    this.sharedService.changeLanguage(language);
  }

}
