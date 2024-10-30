import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
 providedIn: 'root'
})
export class SharedService {
  private languageSource = new BehaviorSubject<string>('en');
  currentLanguage = this.languageSource.asObservable();

  private stateSource = new BehaviorSubject<boolean>(false);
  currentState = this.stateSource.asObservable();

  changeLanguage(language: string) {
    this.languageSource.next(language);
  }

  updateState(state: boolean) {
    this.stateSource.next(state);
  }
}