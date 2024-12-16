import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { RoleService } from '../guards/RoleService';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient,private roleService:RoleService) { }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, { username, password }, { headers })
      .pipe(
        tap((response: any) => {
          localStorage.setItem('token', response.message);
          this.getRoleFromToken().subscribe(role => {
            this.roleService.setRole(role);
          });
        })
      );
  }
  
  getRoleFromToken(): Observable<string> {
    const token = localStorage.getItem('token'); 
    if (!token) {
      throw new Error('Token not found');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get('http://localhost:8080/user/role', { headers, responseType: 'text' }) 
      .pipe(
        map(response => {
          console.log('Response from server:', response);  
          return response;  
        })
      );
  }
  
  
  logout() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.post(this.apiUrl + '/logout', { token }, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) })
        .subscribe(
          () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
          },
          error => {
            console.error('Logout failed', error);
          }
        );
    }
  }
}
