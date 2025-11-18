import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subjects } from '../../models/subjects';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { ClassroomService } from '../../services/classroom.service';
import { SubjectsService } from '../../services/subjects.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-materias',
  imports: [CommonModule],
  templateUrl: './materias.html',
  styleUrl: './materias.css',
})
export class Materias {
  // Usuario Autenticado Actual
  user!: User;

  userID!: User;

  userSub!: any;
  dni!: any;

  currentUser: any;

  // Lista de estudiantes
  students!: User[];

  constructor(private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private subjectService: SubjectsService) { };


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

  // Obtener usuario mediante ID
  getUserByID(id: number): void {
    this.userService.getUserByID(id).subscribe({
      next: (data) => {
        this.userID = data;

        console.log(this.userID);

      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Obtener solo estudiantes
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

  // Lista de Materias
  subjects?: Subjects[];

  // Materia seleccionada para mostrar detalles
  selectedSubject: Subjects | null = null;
  subjectDetails: any = null;

  // Obtener todas las materias
  getSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
      },
      error: (err) => {
        console.error(err);

      }
    });
  }

  // Click en una materia
  onSubjectClick(subject: Subjects) {
    this.selectedSubject = subject;
    this.loadSubjectDetails(subject);
  }

  // Carga los detalles simulados de la materia
  loadSubjectDetails(subject: Subjects) {
    this.subjectDetails = {
      descripcion: `Una breve descripción sobre ${subject.nombre}. Este curso cubre los fundamentos y temas avanzados para proporcionar una comprensión completa.`,
      programaAnalitico: `Unidad 1: Introducción a ${subject.nombre}.\nUnidad 2: Conceptos Clave.\nUnidad 3: Aplicaciones Prácticas.\nUnidad 4: Tópicos Avanzados.\nUnidad 5: Proyecto Final.`,
      clases: [
        { id: 1, nombre: 'Clase 1: Fundamentos', expanded: false },
        { id: 2, nombre: 'Clase 2: Desarrollo de Conceptos', expanded: false },
        { id: 3, nombre: 'Clase 3: Ejercicios Prácticos', expanded: false },
        { id: 4, nombre: 'Clase 4: Revisión y Consultas', expanded: false },
      ]
    };
  }

  // Expande o contrae una clase
  toggleClase(clase: any) {
    clase.expanded = !clase.expanded;
  }

  // --- MÉTODOS DE NAVEGACIÓN Y SESIÓN (COPIADOS DE HOME) ---

  userHasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }

  toggleDropdown(type: 'materias' | 'tareas' | 'grupos' | 'mis-materias' | 'perfil') {
    console.log(`Dropdown seleccionado: ${type}`);

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
    }
  }

  // Navegar al home
  goToHome() {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.getOnlyStudents();
    this.obtainDNIFromAuth();
    this.getUserData();

    this.getSubjects();
  }
}
