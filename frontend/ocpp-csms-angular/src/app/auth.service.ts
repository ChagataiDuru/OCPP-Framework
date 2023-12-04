// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createStore, withProps } from '@ngneat/elf';
import { throwError, of, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { ConfigService } from './config.service';
import { Router } from '@angular/router';
import { response } from 'express';

interface AuthProps {
  token: { id: string } | null;
}

const authStore = createStore(
  { name: 'auth' },
  withProps<AuthProps>({ token: null })
);

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private toastr: ToastrService,private configService: ConfigService) {}
  private apiUrl = this.configService.getApiUrl();

login(credentials: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/login`, credentials, {responseType: "text"}).pipe(
    tap((response: any) => {
      authStore.update((state) => ({
        ...state,
        token: { id: response },
      }));
      console.log('Login successful', response);
      localStorage.setItem('token', response);
    }),
    catchError(error => {
      console.error('Login failed', error);
      this.toastr.error('Login failed. Please check your credentials and try again.', JSON.stringify(error));
      return throwError(() => error);
    })
  );
}

  logout(): void {
    authStore.update((state) => ({
      ...state,
      token: null,
      }));
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    authStore.subscribe((state) => {
      console.log('Checking if user is logged in', state);
      console.log(state.token?.id);
      const token = localStorage.getItem('token');
      console.log(token);
      return token !== null;
    });
    return false;
  }
  
}
