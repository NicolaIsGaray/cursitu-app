import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
// Interfaz para las notificaciones
interface Notification {
  icon: 'assignment' | 'message' | 'system' | 'group';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Interfaz para los Comunicados
interface Comunicado {
  materia: string;
  profesor: string;
  fecha: string;
  hora: string;
  titulo: string;
  mensaje: string;
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
        // Los roles se obtienen del AuthService para mantener una única fuente de verdad.
        const currentUser = this.authService.getCurrentUser();
        this.user = {
          id: data.id,
          email: data.email,
          nombre: data.nombre,
          clave: data.clave,
          dni: data.dni,
          isActive: data.isActive,
          roles: currentUser?.roles || [], // Usamos los roles del AuthService
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

  // --- NOTIFICACIONES ---
  notificationsVisible = false;
  notifications: Notification[] = [
    {
      icon: 'assignment',
      title: 'Nueva tarea asignada',
      message: 'El profesor de "Álgebra y Estadística" ha asignado un nuevo trabajo práctico.',
      time: 'Hace 15 min',
      read: false,
    },
    {
      icon: 'group',
      title: 'Te han añadido a un grupo',
      message: 'Has sido añadido al grupo "Proyecto Final de Sistemas Operativos".',
      time: 'Hace 3 horas',
      read: true,
    },
    {
      icon: 'system',
      title: 'Mantenimiento programado',
      message: 'El sistema estará en mantenimiento este domingo de 02:00 a 04:00 AM.',
      time: 'Ayer',
      read: true,
    },
    {
      icon: 'assignment',
      title: 'Calificación recibida',
      message: 'Tu entrega para "Interpretación de Textos en Inglés" ha sido calificada.',
      time: 'Hace 2 días',
      read: true,
    },
  ];

  // --- COMUNICADOS ---
  comunicados: Comunicado[] = [
    {
      materia: 'Sistemas Operativos Avanzados',
      profesor: 'Mauricio Prades',
      fecha: '21 de Noviembre, 2025',
      hora: '10:30 AM',
      titulo: 'Recordatorio: Entrega de TP2',
      mensaje: 'Recuerden que la fecha límite para la entrega del Trabajo Práctico N°2 es este viernes. No se aceptarán entregas fuera de término.'
    },
    {
      materia: 'Bases de Datos Avanzadas',
      profesor: 'Luis Chiaramonte',
      fecha: '25 de Noviembre, 2025',
      hora: '03:15 PM',
      titulo: 'Cancelación de clase de consulta',
      mensaje: 'La clase de consulta programada para mañana ha sido cancelada por motivos de fuerza mayor. Se reprogramará para la próxima semana.'
    }
  ];


  // Función para cambiar el estado de un dropdown y navegar
  toggleDropdown(type: 'materias' | 'tareas' | 'grupos' | 'mis-materias' | 'perfil') {
    console.log(`Dropdown seleccionado: ${type}`);

    // Navegar el tipo
    if (type === 'tareas') {
      this.router.navigate(['/tareas']);
    } else if (type === 'grupos') {
      this.router.navigate(['/grupos']);
    } else if (type === 'materias') {
      this.router.navigate(['/materias']);
    } else if (type === 'mis-materias') {
      this.router.navigate(['/tareas-docente']);
    } else if (type === 'perfil') {
      this.router.navigate(['/home']); // Temporalmente, puedes cambiarlo a '/perfil'
    } else {
      alert("Parece que hubo un error...");
    }
  }

  // Función para navegar desde las tarjetas
  navigateTo(route: string) {
    console.log(`Navegando a: ${route}`);
    // Aquí puedes mapear las rutas a tus componentes reales
    const routeMap: { [key: string]: string } = {
      'horarios': '/horarios', // Ruta para horarios
      'tareas': '/tareas',
      'grupos': '/grupos',
      'gestionar-grupos': '/grupos', // Profesor
      'mis-materias': '/tareas-docente', // Profesor
    };

    const finalRoute = routeMap[route];
    if (finalRoute) {
      this.router.navigate([finalRoute]);
    }
  }

  // Función para mostrar notificaciones
  toggleNotifications() {
    this.notificationsVisible = !this.notificationsVisible;
    console.log(`Visibilidad de notificaciones: ${this.notificationsVisible}`);
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

  userHasRole(role: string): boolean {
    console.log(this.authService.hasRole(role));
    
    return this.authService.hasRole(role);
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }
}
