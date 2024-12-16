import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
  @Injectable({
    providedIn: 'root'
  })
  export class UserService {

    private apiUrl = 'http://localhost:8080/user/role'; 

    constructor(private http: HttpClient) { }
    getRoleFromToken(): Observable<string> {
      const token = localStorage.getItem('token'); 
      if (!token) {
        throw new Error('Token not found');
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      return this.http.get(this.apiUrl, { headers, responseType: 'text' }) 
        .pipe(
          map(response => {
            console.log('Response from server:', response);  
            return response;  
          })
        );
    }
  }
