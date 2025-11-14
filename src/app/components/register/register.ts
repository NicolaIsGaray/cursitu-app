import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  imports: [RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  user: User = new User();

  private userService = inject(UserService);
  private router = inject(Router);

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
    this.hideError('nameRequired');
    this.hideError('dniLength');
    this.hideError('dniFormat');
    this.hideError('passwordShort');
    this.hideError('passwordMismatch');
  }

  // Valida formato de DNI argentino (7-8 dígitos)
  validateDNI(dni: string): boolean {
    const re = /^\d{7,8}$/;
    return re.test(dni);
  }

  // Valida formato de correos
  validateEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Toggle para mostrar/ocultar contraseña de un campo específico
  togglePasswordVisibility(fieldId: string) {
    const passwordInput = document.getElementById(fieldId) as HTMLInputElement;
    if (passwordInput) {
      // Cambia entre 'password' y 'text'
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    }
  }

  // Procesa el formulario de registro
  // NOTA: Esta validación es temporal, el backend va a manejar el registro real
  getFormData(e: Event) {
    e.preventDefault();
    this.hideAllErrors();

    // Obtengo los valores del form
    const fullnameInput = document.getElementById('fullname') as HTMLInputElement;
    const fullname = fullnameInput.value.trim();

    const dniInput = document.getElementById('dni') as HTMLInputElement;
    const dni = dniInput.value;

    const emailInput = document.getElementById('email') as HTMLInputElement;
    const email = emailInput.value.trim();

    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const password = passwordInput.value;

    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    const confirmPassword = confirmPasswordInput.value;

    // Validación del nombre
    if (!fullname || fullname.length === 0) {
      this.showError('nameRequired');
      return;
    }

    // Validaciones del DNI
    if (dni.length < 8) {
      this.showError('dniLength');
      return;
    }

    if (!this.validateDNI(dni)) {
      this.showError('dniFormat');
      return;
    }

    // Validación del correo
    if (!this.validateEmail(email)) {
      this.showError('emailFormat');
      return;
    }

    // Validación de contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      this.showError('passwordShort');
      return;
    }

    // Validación de que las contraseñas coincidan
    if (password !== confirmPassword) {
      this.showError('passwordMismatch');
      return;
    }

    this.user.nombre = fullname;
    this.user.dni = dni;
    this.user.email = email;
    this.user.clave = password;

    this.user.roles = ["ALUMNO"];

    // Registro exitoso - acá el backend va a crear el usuario en la base de datos
    // y devolver un token o similar
    this.submitUser();
    alert('Registro de usuario exitoso.');
    this.router.navigate(['/home']);
  }

  submitUser() {
    this.userService.addUser(this.user).subscribe({
      next: (data) => {},
      error: (err: any) => {
        console.error(err);
      }
    });
  }
}
