// language.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root' // Đảm bảo dịch vụ này được cung cấp cho toàn bộ ứng dụng
})
export class LanguageService {
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'vi']);
    this.translate.setDefaultLang('en');
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
}
