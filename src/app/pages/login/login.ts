import { Component, inject, signal } from "@angular/core";
import { DataService } from "../../services/data.service";
import { Router } from "@angular/router";

@Component({
    selector: 'login',
    standalone: true,
    imports: [],
    templateUrl: './login.html',
    styleUrls: ['./login.css'],
})
export class Login {
    private dataService = inject(DataService);
    private router = inject(Router);
    email = signal('');
    password = signal('');
    isLoading = signal(false);
    errorMessage = signal('');

    handleLogin(event: Event) {
  event.preventDefault();
  this.isLoading.set(true);

  // 1. Simulas validación de usuario...
  if (this.email() === 'admin@polla.com' && this.password() === '123456') {
    alert("Bienvenido");
    window.location.assign('/phase-1');

  } else {
    this.errorMessage.set('Credenciales incorrectas');
    this.isLoading.set(false);
  }
}
}