import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials = {
    dni: '',
    clave: ''
  };

  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Muestra un mensaje de error específico
  showError(error: string) {
    const messageP = document.getElementById(error) as HTMLElement;
    if (messageP) {
      messageP.style.display = 'block';
    }
  }

  // Oculta un mensaje de error específico
  hideError(error: string) {
    const messageP = document.getElementById(error) as HTMLElement;
    if (messageP) {
      messageP.style.display = 'none';
    }
  }

  // Oculta todos los mensajes de error
  hideAllErrors() {
    this.hideError('dniLength');
    this.hideError('dniFormat');
    this.hideError('dniNotFound');
    this.hideError('wrongPassword');
  }

  // Valida formato de DNI argentino (7-8 dígitos)
  validateDNI(dni: string): boolean {
    const re = /^\d{7,8}$/;
    return re.test(dni);
  }

  // Toggle para mostrar/ocultar contraseña
  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    }
  }

  // Método principal de login
  login(): void {
    this.hideAllErrors();
    this.isLoading = true;

    // Validaciones básicas
    if (!this.credentials.dni) {
      this.showError('dniNotFound')
      this.isLoading = false;
      return;
    }

    if (!this.credentials.clave) {
      this.showError('wrongPassword')
      this.isLoading = false;
      return;
    }

    if (this.credentials.dni && this.validateDNI(this.credentials.dni)) {
    }

    console.log("Credenciales a enviar: " + this.credentials);
    

    // LLAMADA AL BACKEND
    this.authService.login(this.credentials.dni, this.credentials.clave)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en login:', error);
        }
      });
  }

  // Método para limpiar el formulario
  clearForm(): void {
    this.credentials = {
      dni: '',
      clave: ''
    };
    this.hideAllErrors();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.login();
  }
}