import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-withdraw-money',
  standalone: true,
  imports: [],
  templateUrl: './withdraw-money.component.html',
  styleUrls: ['./withdraw-money.component.scss'],
  host: { 'ngSkipHydration': '' }
})
export class WithdrawMoneyComponent implements OnInit, OnDestroy {
  countdownTime: number = 60; 
  timer: string = '01:00';
  countdownInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const storedData = localStorage.getItem('someKey');
      console.log(storedData);
      this.startCountdown();
    } else {
      console.log('Running on the server-side');
    }
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown() {
    if (isPlatformBrowser(this.platformId)) {
      this.countdownInterval = setInterval(() => {
        this.updateCountdown();
      }, 1000);
    }
  }

  updateCountdown() {
    const minutes = Math.floor(this.countdownTime / 60);
    const seconds = this.countdownTime % 60;
    this.timer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    if (this.countdownTime === 0) {
      clearInterval(this.countdownInterval);
      alert('Đếm ngược kết thúc!');
    } else {
      this.countdownTime--; 
    }
  }
}
