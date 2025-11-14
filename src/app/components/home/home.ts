import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

// Interfaz para las tareas
interface Task {
  title: string;
  description: string;
  time: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, NgFor, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

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
        this.user = {
          id: data.id,
          email: data.email,
          nombre: data.nombre,
          clave: data.clave,
          dni: data.dni,
          isActive: data.isActive,
          roles: data.roles,
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

  // Página actual para la paginación
  currentPage = 1;

  // Lista de tareas hardcodeadas (el backend va a traer esto)
  tasks: Task[] = [
    { title: 'Title', description: 'Description', time: '9:41 AM' },
    { title: 'Title', description: 'Description', time: '9:41 AM' },
    { title: 'Title', description: 'Description', time: '9:41 AM' },
  ];

  // Función para cambiar el estado de un dropdown y navegar
  // NOTA: Ahora navega a las páginas específicas de tareas y grupos
  toggleDropdown(type: 'materias' | 'tareas' | 'grupos') {
    console.log(`Dropdown seleccionado: ${type}`);

    // Navegar el tipo
    if (type === 'tareas') {
      this.router.navigate(['/tareas']);
    } else if (type === 'grupos') {
      this.router.navigate(['/grupos']);
    } else if (type === 'materias') {
      this.router.navigate(['/materias']);
    } else {
      alert("Parece que hubo un error...");
    }
  }

  // Función para mostrar notificaciones
  toggleNotifications() {
    console.log('Abriendo notificaciones');
    // Acá el backend va a traer las notificaciones del usuario
    alert('Panel de notificaciones - el backend va a cargar esto');
  }

  // Navegar a la página anterior
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      console.log(`Página actual: ${this.currentPage}`);
      // Acá el backend va a cargar los datos de la página anterior
    }
  }

  // Navegar a la siguiente página
  nextPage() {
    this.currentPage++;
    console.log(`Página actual: ${this.currentPage}`);
    // Acá el backend va a cargar los datos de la página siguiente
  }


  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.obtainDNIFromAuth();
    this.getUserData();
    this.getOnlyStudents();
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }
}
