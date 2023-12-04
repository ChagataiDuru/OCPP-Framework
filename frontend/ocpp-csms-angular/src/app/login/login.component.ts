import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  public credentials = { username: '', password: '' };

  constructor(private authService: AuthService,private router: Router) {}

login(): void {
  this.authService
    .login(this.credentials)
    .subscribe(() => {
      console.log('Redirecting to home page');
      this.router.navigate(['']);
    });
}
}
