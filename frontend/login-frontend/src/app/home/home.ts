import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  username = signal('');
  private router = new Router();

  ngOnInit() {
    // Busca el token en localStorage o sessionStorage
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/']);
      return;
    }
    // Decodifica el token JWT para obtener el username
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.username.set(payload.username || 'Usuario');
    } catch {
      this.username.set('Usuario');
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    this.router.navigate(['/']);
  }
}