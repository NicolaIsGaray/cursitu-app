import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Subjects } from '../../models/subjects';
import { SubjectsService } from '../../services/subjects.service';
import { Classroom } from '../../models/classroom';
import { ClassroomService } from '../../services/classroom.service';
import { Sidebar, UserRole } from '../sidebar/sidebar';

@Component({
  selector: 'app-administrador',
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './administrador.html',
  styleUrl: './administrador.css',
})
export class Administrador {
  // Rol del usuario para el sidebar
  currentRole: UserRole = 'admin';

  /**
   * ═══════════════════════════════════════════════════════════════
   * FILTRO FRONTEND-ONLY - Para conectar al backend leer esto:
   * ═══════════════════════════════════════════════════════════════
   * Campo UI: studentSearchTerm (input text)
   * Tipo: string
   * Filtra por: nombre o DNI del estudiante (case-insensitive)
   *
   * CÓMO CONECTAR AL BACKEND:
   * 1. Crear endpoint: GET /api/usuarios/estudiantes?search={studentSearchTerm}
   * 2. En UserService, agregar método:
   *    searchStudents(term: string): Observable<User[]>
   * 3. Reemplazar el getter 'filteredStudents' por llamada al service
   * ═══════════════════════════════════════════════════════════════
   */
  studentSearchTerm: string = '';

  get filteredStudents(): User[] {
    if (!this.students) return [];
    if (!this.studentSearchTerm.trim()) return this.students;
    const term = this.studentSearchTerm.toLowerCase();
    return this.students.filter(s =>
      s.nombre.toLowerCase().includes(term) ||
      s.dni.toString().includes(term)
    );
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * FILTRO FRONTEND-ONLY - Para conectar al backend leer esto:
   * ═══════════════════════════════════════════════════════════════
   * Campo UI: teacherSearchTerm (input text)
   * Tipo: string
   * Filtra por: nombre del docente (case-insensitive)
   *
   * CÓMO CONECTAR AL BACKEND:
   * 1. Crear endpoint: GET /api/usuarios/docentes?search={teacherSearchTerm}
   * 2. En UserService, agregar método:
   *    searchTeachers(term: string): Observable<User[]>
   * 3. Reemplazar el getter 'filteredTeachers' por llamada al service
   * ═══════════════════════════════════════════════════════════════
   */
  teacherSearchTerm: string = '';

  get filteredTeachers(): User[] {
    if (!this.teachers) return [];
    if (!this.teacherSearchTerm.trim()) return this.teachers;
    return this.teachers.filter(t =>
      t.nombre.toLowerCase().includes(this.teacherSearchTerm.toLowerCase())
    );
  }

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
    const confirmationMessage = '¿Estás seguro de que deseas borrar este usuario? Esta acción no se puede deshacer.';
    this.showConfirmationDialog(confirmationMessage, () => {
      this.userService.deleteUser(id).subscribe({
        next: (response) => {
          this.showCustomAlert("Usuario eliminado exitosamente.", 'success');
          if (this.students) {
            this.students = this.students.filter(student => student.id !== id);
          }
        },
        error: (err) => {
          this.showCustomAlert("Hubo un error al eliminar al usuario.", 'error');
          console.error(err);
        }
      });
    });
  }

  // Lista de Cursos
  classrooms?: Classroom[];

  // Obtener todos los cursos
  getAllClassrooms(): void {
    this.classroomService.getClassrooms().subscribe({
      next: (data) => {
        this.classrooms = data.map(classroom => {
          classroom.profesores = new Set(classroom.profesores);
          classroom.alumnos = new Set(classroom.alumnos);
          return classroom;
        });
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

    if (isNaN(classNumber) || classNumber <= 0) {
      this.showCustomAlert('El número del curso debe ser un número positivo o mayor a 0.', 'error');
      return;
    } else {
      this.hideError('invalid-number-error');
    }

    const yearIn = document.getElementById('classroom-year') as HTMLSelectElement;
    const year: string = yearIn.value;

    const comisionIn = document.getElementById('classroom-comision') as HTMLSelectElement;
    const comision: string = comisionIn.value;

    const studentReferences = this.selectedStudentIds.map(id => ({ id }));
    const profesorReferences = this.selectedTeacherIds.map(id => ({ id }));

    const payload = {
      classroom: {
        numeroCurso: classNumber,
        year: year,
        comision: comision,
        profesores: profesorReferences,
        alumnos: studentReferences
      }
    };

    this.sendNewClassroom(payload);
  }

  // Limpia el formulario de creación de cursos
  clearCreateClassroomForm(): void {
    const numberIn = document.getElementById('classroom-number') as HTMLInputElement;
    if (numberIn) numberIn.value = '';

    const yearIn = document.getElementById('classroom-year') as HTMLSelectElement;
    if (yearIn) yearIn.selectedIndex = 0;

    const comisionIn = document.getElementById('classroom-comision') as HTMLSelectElement;
    if (comisionIn) comisionIn.selectedIndex = 0;

    const checkboxes = document.querySelectorAll('.form-section input[type="checkbox"]');
    checkboxes.forEach(cb => (cb as HTMLInputElement).checked = false);

    this.selectedStudentIds = [];
    this.selectedTeacherIds = [];
  }

  // Agregar curso - Enviar curso
  sendNewClassroom(payload: any): void {
    this.classroomService.addClassroom(payload).subscribe({
      next: (data: any) => {
        this.showCustomAlert("Curso creado exitosamente.", 'success');
        this.getAllClassrooms();
        this.clearCreateClassroomForm();
      },
      error: (err) => {
        this.showCustomAlert("Hubo un problema al crear el curso.", 'error');
        console.error(err);
      }
    });
  }

  // Eliminar curso - Enviar curso
  eraseClassroom(id: number): void {
    const confirmationMessage = '¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.';
    this.showConfirmationDialog(confirmationMessage, () => {
      this.classroomService.deleteClassroom(id).subscribe({
        next: (response) => {
          this.showCustomAlert("Curso eliminado exitosamente.", 'success');
          this.getAllClassrooms();
        },
        error: (err) => {
          this.showCustomAlert("Hubo un problema al eliminar el curso.", 'error');
          console.error(err);
        }
      });
    });
  }

  /**
   * Verifica si un estudiante ya está inscrito en cualquier curso.
   * @param studentId
   * @returns
   */
  isStudentInAnyCourse(studentId: number): boolean {
    if (!this.classrooms) {
      return false;
    }
    for (const classroom of this.classrooms) {
      if (classroom.alumnos) {
        for (const alumno of classroom.alumnos) {
          if (alumno.id === studentId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Quitar un alumno de un curso
  removeStudentFromClassroom(classroomId: number, studentId: number): void {
    const confirmationMessage = '¿Estás seguro de que deseas quitar a este alumno del curso?';
    this.showConfirmationDialog(confirmationMessage, () => {
      this.classroomService.removeStudent(classroomId, studentId).subscribe({
        next: (response) => {
          this.showCustomAlert('Alumno quitado del curso exitosamente.', 'success');
          this.getAllClassrooms();
        },
        error: (err) => {
          this.showCustomAlert('Error al quitar al alumno.', 'error');
        }
      });
    });
  }

  // Quitar un profesor de un curso
  removeTeacherFromClassroom(classroomId: number, teacherId: number): void {
    const confirmationMessage = '¿Estás seguro de que deseas quitar a este profesor del curso?';
    this.showConfirmationDialog(confirmationMessage, () => {
      this.classroomService.removeTeacher(classroomId, teacherId).subscribe({
        next: (response) => {
          this.showCustomAlert('Profesor quitado del curso exitosamente.', 'success');
          this.getAllClassrooms();
        },
        error: (err) => {
          this.showCustomAlert('Error al quitar al profesor.', 'error');
        }
      });
    });
  }

  // Agregar un alumno a un curso existente
  addStudentToClassroom(classroomIdStr: string, studentIdStr: string): void {
    const classroomId = parseInt(classroomIdStr, 10);
    const studentId = parseInt(studentIdStr, 10);

    if (isNaN(classroomId) || isNaN(studentId)) {
      this.showCustomAlert('Por favor, seleccione un curso y un alumno válidos.', 'error');
      return;
    }

    this.classroomService.addStudentToClassroom(classroomId, studentId).subscribe({
      next: (response) => {
        this.showCustomAlert('Alumno agregado al curso exitosamente.', 'success');

        // Actualizar el estado local
        const classroom = this.classrooms?.find(c => c.id === classroomId);
        const student = this.students?.find(s => s.id === studentId);

        if (classroom && student) {
          classroom.alumnos.add(student);
        }
      },
      error: (err) => {
        this.showCustomAlert('Error al agregar el alumno al curso.', 'error');
        console.error(err);
      }
    });
  }

  // Agregar un profesor a un curso existente
  addTeacherToClassroom(classroomIdStr: string, teacherIdStr: string): void {
    const classroomId = parseInt(classroomIdStr, 10);
    const teacherId = parseInt(teacherIdStr, 10);

    if (isNaN(classroomId) || isNaN(teacherId)) {
      this.showCustomAlert('Por favor, seleccione un curso y un profesor válidos.', 'error');
      return;
    }

    this.classroomService.addTeacherToClassroom(classroomId, teacherId).subscribe({
      next: (response) => {
        this.showCustomAlert('Profesor agregado al curso exitosamente.', 'success');

        // Actualizar el estado local
        const classroom = this.classrooms?.find(c => c.id === classroomId);
        const teacher = this.teachers?.find(t => t.id === teacherId);

        if (classroom && teacher) {
          classroom.profesores.add(teacher);
        }
      },
      error: (err) => {
        this.showCustomAlert('Error al agregar el profesor al curso.', 'error');
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

    const colorInput = document.getElementById("materia-color") as HTMLInputElement;
    const subjectColor = colorInput.value;

    if (subjectName == '') {
      this.showError('blankName');
    } else {
      this.hideError('blankName');
    }

    this.subjectToSend.nombre = subjectName;
    this.subjectToSend.color = subjectColor;

    this.sendNewSubject(this.subjectToSend);
  }

  // Agregar una materia - Enviar materia
  sendNewSubject(subject: Subjects): void {
    this.subjectService.addSubject(subject).subscribe({
      next: (result) => {
        this.showCustomAlert("Materia agregada exitosamente.", 'success');
        this.getSubjects();
      },
      error: (err) => {
        this.showCustomAlert("Hubo un error al agregar la materia.", 'error');

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
    const confirmationMessage = '¿Estás seguro de que deseas borrar esta materia?';
    this.showConfirmationDialog(confirmationMessage, () => {
      this.subjectService.deleteSubject(id).subscribe({
        next: (response) => {
          this.showCustomAlert("Materia eliminada exitosamente.", 'success');
          if (this.subjects) {
            this.subjects = this.subjects.filter(subject => subject.id !== id);
          }
        },
        error: (err) => {
          this.showCustomAlert("Parece que hubo un error al eliminar la materia.", 'error');
          console.error(err);
        }
      });
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

    this.userService.assignSubjectToTeacher(payload).subscribe({
      next: (response) => {
        this.showCustomAlert("Materia asignada correctamente.", 'success');
      },
      error: (err) => {
        this.showCustomAlert("Hubo un error al asignar la materia.", 'error');
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
    const confirmationMessage = '¿Estás seguro de que deseas confirmar a este usuario como docente?';
    this.showConfirmationDialog(confirmationMessage, () => {
      this.userService.confirmTeacherRequest(id).subscribe({
        next: (response) => {
          this.showCustomAlert("Rol de PROFESOR otorgado.", 'success');
          if (this.solitudes) {
            this.solitudes = this.solitudes.filter(solitude => solitude.id !== id);
          }
          this.getOnlyTeachers();
          this.getOnlyStudents();
        },
        error: (err) => {
          this.showCustomAlert("Hubo un error al autorizar el rol.", 'error');
          console.error(err);
        }
      });
    });
  }

  // Rechazar solicitud de rol
  denyRoleRequest(id: number) {
    const confirmationMessage = '¿Estás seguro de que deseas denegar esta solicitud?';
    this.showConfirmationDialog(confirmationMessage, () => {
      this.userService.denyTeacherRequest(id).subscribe({
        next: (response) => {
          this.showCustomAlert("Rol de PROFESOR denegado.", 'success');
          if (this.solitudes) {
            this.solitudes = this.solitudes.filter(solitude => solitude.id !== id);
          }
        },
        error: (err) => {
          this.showCustomAlert("Hubo un error al denegar el rol.", 'error');
          console.error(err);
        }
      });
    });
  }

  // Propiedades para manejar el estado de los paneles
  activePanel: string | null = null;
  activeComision: 'A' | 'B' | null = 'A';

  // Propiedad para controlar la visibilidad del menú de opciones en móvil
  mobileOptionsVisible = false;

  // Alterna la visibilidad del menú de opciones en móvil
  toggleMobileOptions(): void {
    this.mobileOptionsVisible = !this.mobileOptionsVisible;
  }

  // Propiedades para el diálogo de confirmación
  confirmationDialog = { visible: false, message: '', onConfirm: () => { } };

  // Propiedades para notificaciones personalizadas
  notifications: { message: string, type: 'success' | 'error' }[] = [];

  /**
   * Muestra una notificación personalizada.
   * @param message
   * @param type
   */
  showCustomAlert(message: string, type: 'success' | 'error') {
    this.notifications.push({ message, type });
    setTimeout(() => {
      this.notifications.shift();
    }, 5000);
  }

  /**
   * Muestra un diálogo de confirmación personalizado.
   * @param message
   * @param onConfirmCallback
   */
  showConfirmationDialog(message: string, onConfirmCallback: () => void) {
    this.confirmationDialog.message = message;
    this.confirmationDialog.onConfirm = onConfirmCallback;
    this.confirmationDialog.visible = true;
  }

  /**
   * Ejecuta la acción de confirmación y cierra el diálogo.
   */
  onConfirmDialog() {
    if (this.confirmationDialog.onConfirm) {
      this.confirmationDialog.onConfirm();
    }
    this.hideConfirmationDialog();
  }

  /**
   * Cierra el diálogo de confirmación sin ejecutar la acción.
   */
  hideConfirmationDialog() {
    this.confirmationDialog = { visible: false, message: '', onConfirm: () => { } };
  }

  // Manejar click en dropdown
  onDropdownClick(section: string) {
    if (this.activePanel === section) {
      this.activePanel = null;
    } else {
      this.activePanel = section;
    }
    this.mobileOptionsVisible = false;
  }

  /**
   * Alterna la visibilidad de las comisiones.
   * @param comision 'A' o 'B'
   */
  toggleComision(comision: 'A' | 'B') {
    if (this.activeComision === comision) {
      this.activeComision = null;
    } else {
      this.activeComision = comision;
    }
  }

  // Navegar al home
  goToHome() {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.onDropdownClick('cursos')

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