import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ClassroomService } from '../../services/classroom.service';
import { SubjectsService } from '../../services/subjects.service';
import { Subjects } from '../../models/subjects';
import { Group } from '../../models/group';
import { GroupService } from '../../services/group.service';

// Interfaz para los miembros del grupo
interface GroupMember {
  initial: string;
  name: string;
  isSelected: boolean;
}

interface GroupCreateDTO {
    nombre: string;
    limite: number;
    comision: string;
    miembros: Set<User>; 
    pendientes: Set<User>;
}

@Component({
  selector: 'app-grupos',
  imports: [CommonModule, FormsModule],
  templateUrl: './grupos.html',
  styleUrl: './grupos.css',
})
export class Grupos {
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
    private groupService: GroupService,
    private classroomService: ClassroomService,
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

  // Lista de Grupos
  groups!: Group[];

  // Obtener todos los grupos
  getAllGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.filterGroupsBySubject();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Crear grupo - Enviar objeto
  getGroupForm(): void {
    const nombreIn = document.getElementById('group-name') as HTMLInputElement;
    const nombre = nombreIn.value.trim();

    if (!nombre) {
      alert("El nombre del grupo no puede estar vacío.");
      return;
    }

    const limiteIn = document.getElementById('group-limit') as HTMLInputElement;
    const limite = Number(limiteIn.value);

    if (isNaN(limite) || limite < 1 || limite > 6) {
      alert("El límite de integrantes debe ser un número entero entre 1 y 6.");
      return;
    }
    
    const miembrosSet = new Set<User>();
    miembrosSet.add(this.user);

    const newGroup: GroupCreateDTO = {
      nombre: nombre,
      limite: limite,
      comision: this.user.comision,
      miembros: miembrosSet,
      pendientes: new Set<User>()
    }

    this.sendNewGroup(newGroup);
  }

  // Crear grupo - Enviar objeto
  sendNewGroup(group: any): void {
    this.groupService.createGroup(group).subscribe({
      next: (response) => {
        alert("Grupo creado exitosamente.");
      },
      error: (err) => {
        alert("Hubo un error al crear el grupo.");
        console.error(err);
      }
    });
  }

  // Dropdown de "Grupos" está expandido por defecto
  isGroupsExpanded = true;

  // Nombre del alumno a invitar
  newMemberName = '';

  // Propiedades para filtrar grupos por materia
  selectedSubjectId: number | null = null;
  filteredGroups: Group[] = [];

  // Toggle de cada materia
  toggleSubject(subject: Subjects) {
    // Si se hace clic en la misma materia, se deselecciona.
    if (this.selectedSubjectId === subject.id) {
      this.selectedSubjectId = null;
    } else {
      this.selectedSubjectId = subject.id;
    }
    this.filterGroupsBySubject();
  }

  // Filtra los grupos basándose en la materia seleccionada
  filterGroupsBySubject(): void {
    if (!this.groups) {
      this.filteredGroups = [];
      return;
    }

    if (this.selectedSubjectId === null) {
      this.filteredGroups = this.groups;
      return;
    }
    this.filteredGroups = this.groups.filter(g => g.comision === this.user.comision);
  }
  // Invitar alumno al grupo
  inviteToGroup(group: Group) {
    if (this.newMemberName.trim()) {
      console.log(`Invitando a ${this.newMemberName} al grupo ${group.nombre}`);
      // Acá el backend va a enviar la invitación
      alert(`Funcionalidad de invitar - el backend va a invitar a: ${this.newMemberName}`);
      this.newMemberName = '';
    } else {
      alert('Ingresá un nombre de alumno');
    }
  }

  // Salir del grupo
  leaveGroup(group: Group) {
    console.log(`Saliendo del grupo ${group.nombre}`);
    // Acá el backend va a remover al usuario del grupo
    alert(`Funcionalidad de salir del grupo - el backend va a procesar esto`);
  }

  // Unirse a un grupo
  joinGroup() {
    console.log('Uniéndose a un grupo');
    // Acá el backend va a mostrar la lista de grupos disponibles
    alert('Funcionalidad de unirse a un grupo - el backend va a mostrar grupos disponibles');
  }

  // Inicializar
  ngOnInit(): void {
    this.getOnlyStudents();
    this.obtainDNIFromAuth();
    this.getUserData();

    this.getSubjects();
    this.getAllGroups();
  }

  // Navegar al home/dashboard
  goToHome() {
    this.router.navigate(['/home']);
  }
}
