import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public credentials = { username: '', password: '' };

  constructor(private authService: AuthService) {}

  login(): void {
    this.authService.login(this.credentials);
  }
}
