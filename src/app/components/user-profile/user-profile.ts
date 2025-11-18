import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';

interface UpdateUserDTO {
  id: number
  email: string;
  nombre: string;
  clave: string;
  dni: string;
}

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
  standalone: true,
})
export class UserProfile {
  // Usuario Autenticado Actual
    user!: User;
    userSub!: any;
    dni!: any;
  
    currentUser: any;
  
    // Lista de estudiantes
    students!: User[];
  
    constructor(private router: Router,
      private authService: AuthService,
      private userService: UserService) { };
  
  
    // Obtener datos del usuario actual
    getUserData() {
      this.userService.getUserInfo(this.dni).subscribe({
        next: (data: any) => {
          // Los roles se obtienen del AuthService para mantener una única fuente de verdad.
          const currentUser = this.authService.getCurrentUser();
          this.user = {
            id: data.id,
            email: data.email,
            nombre: data.nombre,
            clave: data.clave,
            dni: data.dni,
            isActive: data.isActive,
            roles: currentUser?.roles || [],
            comision: data.comision || []
          };
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  
    // Obtener solo los estudiantes para el listado
    getOnlyStudents(): void {
      this.userService.getUsers().subscribe({
        next: (data) => {
          this.students = data.filter((user: User) => {
            if (!user.roles || !Array.isArray(user.roles)) {
              return true;
            }
  
            const hasProfesorRole = user.roles.some((roleObj: any) =>
              roleObj.role?.toUpperCase().includes('PROFESOR') ||
              roleObj.role?.toUpperCase().includes('ADMIN')
            );
  
            return !hasProfesorRole;
          });
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  
    // Obtener el DNI del usuario autenticado
    obtainDNIFromAuth(): void {
      this.userSub = this.authService.currentUser$.subscribe(user => {
        this.dni = user?.username || null;
      });
    }

    // Obtener formulario si cambio datos del perfil
    getUpdatedData(): void {
      const newPassIn = document.getElementById('new-password') as HTMLInputElement;
      const newPass = newPassIn.value;

      const formData = {
        id: this.user.id,
        email: this.user.email,
        nombre: this.user.nombre,
        clave: newPass,
        dni: this.user.dni
      };

      this.sendUpdatedUser(formData);
    }

    sendUpdatedUser(user: UpdateUserDTO): void {
      this.userService.editUser(user.id, user).subscribe({
        next: () => {
          this.showCustomAlert('Usuario Actualizado', 'success');
        },
        error: (err) => {
          this.showCustomAlert('Error al actualizar el usuario', 'error');
          console.error(err);
        }
      });
    }

  // Propiedades para notificaciones personalizadas
  notifications: { message: string; type: 'success' | 'error' }[] = [];

  /**
   * Muestra una notificación personalizada.
   * @param message
   * @param type
   */
  showCustomAlert(message: string, type: 'success' | 'error') {
    this.notifications.push({ message, type });
    setTimeout(() => this.notifications.shift(), 5000); // La alerta desaparece a los 5 segundos
  }

  activeSection = 'cuenta';

  showPasswordChange = false;

  toggleDropdown(
    type: 'materias' | 'tareas' | 'grupos' | 'mis-materias' | 'perfil'
  ) {
    const routeMap = {
      perfil: '/perfil',
      materias: '/materias',
      'mis-materias': '/tareas-docente',
      tareas: '/tareas',
      grupos: '/grupos',
    };

    const route = routeMap[type];
    if (route) {
      this.router.navigate([route]);
    }
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  togglePasswordChange(): void {
    this.showPasswordChange = true;
  }

  userHasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  // Navegar al home
  goToHome() {
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }

  ngOnInit(): void {
    this.obtainDNIFromAuth();
    this.getUserData();
    this.getOnlyStudents();
  }
}
