import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private roleSubject: BehaviorSubject<string | null>;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    const savedRole = isPlatformBrowser(this.platformId) ? localStorage.getItem('role') : null;
    this.roleSubject = new BehaviorSubject<string | null>(savedRole);
  }
  getRole() {
    console.log('Current role:', this.roleSubject.getValue()); 
    return this.roleSubject.asObservable();
  }
  setRole(role: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('role', role);  
    }
    console.log('Setting role:', role); 
    this.roleSubject.next(role);  
  }
  
}
