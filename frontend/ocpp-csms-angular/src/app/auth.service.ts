// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

import { createStore, withProps, select } from '@ngneat/elf';
import {
  persistState,
  localStorageStrategy,
  sessionStorageStrategy,
} from '@ngneat/elf-persist-state';
import { throwError, of, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ConfigService } from './config.service';

interface AuthProps {
  user: { id: string } | null;
}

const authStore = createStore({ name: 'auth' }, withProps<AuthProps>({ user: null }));

export const persist = persistState(authStore, {
  key: 'auth',
  storage: localStorageStrategy,
});

export const user$ = authStore.pipe(select((state) => state.user));

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
        user: { id: response },
      }));
      console.log('Login successful', response);
      console.log('authStore', authStore.getValue());
      localStorage.setItem('user', response);
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
      user: null,
      }));
    localStorage.removeItem('user');
  }

  isLoggedIn(): Observable<boolean> {
    return authStore.pipe(select((state) => !!state.user?.id));
  }
  
}
