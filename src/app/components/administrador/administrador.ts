import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Subjects } from '../../models/subjects';
import { SubjectsService } from '../../services/subjects.service';
import { Classroom } from '../../models/classroom';
import { ClassroomService } from '../../services/classroom.service';

@Component({
  selector: 'app-administrador',
  imports: [CommonModule],
  templateUrl: './administrador.html',
  styleUrl: './administrador.css',
})
export class Administrador {

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

  // Eliminar alumno
  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: (response) => {
        alert("Usuario eliminado exitosamente.");
      },
      error: (err) => {
        alert("Hubo un error al eliminar al usuario.");
        console.error(err);
      }
    });
  }

  // Lista de Cursos
  classrooms?: Classroom[];

  // Obtener todos los cursos
  getAllClassrooms(): void {
    this.classroomService.getClassrooms().subscribe({
      next: (data) => {
        this.classrooms = data;
      },
      error: (err) => {
        console.error(err);

      }
    });
  }

  // Agregar un curso - Creación del objeto
  selectedStudentIds: number[] = [];
  selectedTeacherIds: number[] = [];

  // Agregar un curso - Función para alternar la selección
  toggleSelection(id: number, event: any, targetArray: number[]) {
    const isChecked = event.target.checked;

    const index = targetArray.indexOf(id);

    if (isChecked) {
      if (index === -1) {
        targetArray.push(id);
      }
    } else {
      if (index > -1) {
        targetArray.splice(index, 1);
      }
    }
  }

  // Agregar un curso - Obtener datos de formulario
  createClassroom(): void {
    const numberIn = document.getElementById('classroom-number') as HTMLInputElement;
    const classNumber = numberIn.valueAsNumber;

    const yearIn = document.getElementById('classroom-year') as HTMLSelectElement;
    const year: string = yearIn.value;

    const studentReferences = this.selectedStudentIds.map(id => ({ id }));
    const profesorReferences = this.selectedTeacherIds.map(id => ({ id }));

    const payload = {
      classroom: {
        numeroCurso: classNumber,
        year: year,
        profesores: profesorReferences
      },
      students: studentReferences
    };

    this.sendNewClassroom(payload);
  }

  // Agregar curso - Enviar curso
  sendNewClassroom(payload: any): void {
    this.classroomService.addClassroom(payload).subscribe({
      next: (data) => {
        alert("Curso creado exitosamente.");
      },
      error: (err) => {
        alert("Hubo un problema al crear el curso.")
        console.error(err);
      }
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

  // Agregar una materia - Creación del objeto
  subjectToSend: Subjects = new Subjects();

  // Agregar una materia - Obtención de datos
  getSubjectData(): void {
    const nameInput = document.getElementById("nombre-materia") as HTMLInputElement;
    const subjectName = nameInput.value;

    if (subjectName == '') {
      this.showError('blankName');
    } else {
      this.hideError('blankName');
    }

    this.subjectToSend.nombre = subjectName;

    this.sendNewSubject(this.subjectToSend);
  }

  // Agregar una materia - Enviar materia
  sendNewSubject(subject: Subjects): void {
    this.subjectService.addSubject(subject).subscribe({
      next: (result) => {
        alert("Materia agregada exitosamente.")
        window.location.reload();
      },
      error: (err) => {
        console.error(err);

      }
    });
  }

  // Eliminar una materia - Obtener ID
  getSubjectID(id: number): void {
    this.subjectService.getSubjectByID(id).subscribe({
      next: (data) => {
        this.eraseSubject(id);
      },
      error: (err) => {
        console.error(err);

      }
    });
  }

  // Eliminar una materia - Enviar objeto
  eraseSubject(id: number): void {
    this.subjectService.deleteSubject(id).subscribe({
      next: (response) => {
        alert("Materia eliminada exitosamente.");
        window.location.reload();
      },
      error: (err) => {
        alert("Parece que hubo un error...");
        console.error(err);

      }
    });
  }

  // Lista de Docentes
  teachers?: User[];

  // Obtener solo los docentes
  getOnlyTeachers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.teachers = data.filter((user: User) => {
          if (!user.roles || !Array.isArray(user.roles)) {
            return true;
          }

          const isNotAProfessor = user.roles.some((roleObj: any) =>
            roleObj.role?.toUpperCase().includes('ALUMNO') ||
            roleObj.role?.toUpperCase().includes('ADMIN')
          );

          return !isNotAProfessor;
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Asignar materia - Obtención de datos
  asignarMateria(profesorId: number, materiaIdStr: string) {
    
    if (!profesorId || !materiaIdStr) {
        console.error('Debe seleccionar un profesor y una materia.');
        return;
    }
    
    const materiaId = Number(materiaIdStr);

    const payload = {
        profesorId: profesorId,
        materiaId: materiaId
    };

    console.log('Payload a enviar:', payload);
    
    this.userService.assignSubjectToTeacher(payload).subscribe({
      next: (response) => {
        alert("Materia asignada correctamente.");
      },
      error: (err) => {
        alert("Hubo un error al asignar la materia.");
        console.error(err);
        
      }
    }
    );
}

  // Lista de Solicitudes
  solitudes?: User[];

  // Obtener Solicitudes
  getRequests(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.solitudes = data.filter((user: User) => {
          if (user.requestForTeacherRole) {
            return true;
          } else {
            return false;
          }
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Confirmar solicitud de rol
  confirmRoleRequest(id: number) {
    this.userService.confirmTeacherRequest(id).subscribe({
      next: (response) => {
        alert("Rol de PROFESOR otorgado.");
      },
      error: (err) => {
        alert("Hubo un error al autorizar el rol.");
        console.error(err);
        
      }
    });
  }

  // Rechazar solicitud de rol
  denyRoleRequest(id: number) {
    this.userService.denyTeacherRequest(id).subscribe({
      next: (response) => {
        alert("Rol de PROFESOR denegado.");
      },
      error: (err) => {
        alert("Hubo un error al denegar el rol.");
        console.error(err);
        
      }
    });
  }

  // Manejar click en dropdown
  onDropdownClick(section: string) {
    const itemSelected = document.getElementById(section) as HTMLElement;

    itemSelected.classList.toggle("showPanel");
  }

  // Navegar al home
  goToHome() {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.obtainDNIFromAuth();
    this.getUserData();
    this.getOnlyStudents();

    this.getSubjects();

    this.getAllClassrooms();

    this.getOnlyTeachers();

    this.getRequests();
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  logout(): void {
    this.authService.logout();
  }
}