// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createStore, withProps } from '@ngneat/elf';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { ConfigService } from './config.service';

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

  login(credentials: any): void {
    this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      catchError(error => {
        console.error('Login failed', error);
        this.toastr.error('Login failed. Please check your credentials and try again.');
        return throwError(() => error);
      })
    ).subscribe(
      (response: any) => {
        authStore.update((state) => ({
          ...state,
          token: response.token,
        }));
        console.log('Login successful', response.token)
        localStorage.setItem('token', response.token);
      }
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
      return !!state.token !== null;
    });
    return false;
  }
}
