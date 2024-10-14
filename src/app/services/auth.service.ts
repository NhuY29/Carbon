import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, { username, password }, { headers })
      .pipe(
        tap((response: any) => {

          localStorage.setItem('token', response.message);
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
          },
          error => {
            console.error('Logout failed', error);
          }
        );
    }
  }
}
