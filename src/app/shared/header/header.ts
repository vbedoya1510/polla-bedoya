import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header {
  isMenuOpen = false;
  isLogin: boolean = false;
  public authService = inject(AuthService);
  private router = inject(Router);

  goTo(namePage: string) {
    //window.location.assign(`/${namePage}`);
    this.router.navigate([`/${namePage}`]);
  }

  toggleMenu(): void {
  this.isMenuOpen = !this.isMenuOpen;
}
}
