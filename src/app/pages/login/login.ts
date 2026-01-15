import { Component, inject, OnInit, signal } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";

@Component({
    selector: 'login',
    standalone: true,
    imports: [],
    templateUrl: './login.html',
    styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
    email = signal('');
    password = signal('');
    isLoading = signal(false);
    errorMessage = signal('');

ngOnInit(): void {
  if(this.authService.isLoggedIn()) {
    this.router.navigate(['/phase-1']);
  }
}

    handleLogin(event: Event) {
  event.preventDefault();
  this.isLoading.set(true);

  // 1. Simulas validación de usuario...
  if (this.email() === 'admin@polla.com' && this.password() === '123456') {
    alert("Bienvenido");
    this.authService.registerLogin(true);
    this.router.navigate(['/phase-1']);
  } else {
    this.errorMessage.set('Credenciales incorrectas');
    this.isLoading.set(false);
  }
}
}