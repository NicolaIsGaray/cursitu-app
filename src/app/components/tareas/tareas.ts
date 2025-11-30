import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subjects } from '../../models/subjects';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { SubjectsService } from '../../services/subjects.service';
import { Sidebar, UserRole } from '../sidebar/sidebar';

// Interfaz para las tareas/trabajos prácticos
interface Assignment {
  title: string;
  dueDate: string;
  status: 'Pendiente' | 'Entregado';
  fileType: 'pdf' | 'excel';
}

@Component({
  selector: 'app-tareas',
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './tareas.html',
  styleUrl: './tareas.css',
})
export class Tareas {
  // Rol del usuario para el sidebar
  currentRole: UserRole = 'estudiante';

  /**
   * ═══════════════════════════════════════════════════════════════
   * FILTRO FRONTEND-ONLY - Para conectar al backend leer esto:
   * ═══════════════════════════════════════════════════════════════
   * Campo UI: statusFilter (select)
   * Tipo: 'all' | 'Pendiente' | 'Entregado'
   * Filtra por: estado de la tarea
   *
   * CÓMO CONECTAR AL BACKEND:
   * 1. Crear endpoint: GET /api/tareas?status={statusFilter}&materiaId={id}
   * 2. En el service, agregar método:
   *    getTareas(materiaId: number, status?: string): Observable<Assignment[]>
   * 3. Reemplazar el getter 'filteredAssignments' por llamada al service
   * ═══════════════════════════════════════════════════════════════
   */
  statusFilter: string = 'all';

  get filteredAssignments(): Assignment[] {
    if (this.statusFilter === 'all') {
      return this.displayedAssignments;
    }
    return this.displayedAssignments.filter(a => a.status === this.statusFilter);
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
    private subjectService: SubjectsService) { };


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
  selectedSubjectId: number | null = null;

  // Obtener todas las materias
  getSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
        this.createMockAssignments(); // Crear tareas simuladas una vez que tenemos las materias
      },
      error: (err) => {
        console.error(err);

      }
    });
  }

  // Almacén de todas las tareas simuladas, mapeadas por ID de materia
  allAssignments: Map<number, Assignment[]> = new Map();
  // Tareas que se muestran actualmente en la UI
  displayedAssignments: Assignment[] = [];

  // Simula la creación de tareas para cada materia
  createMockAssignments(): void {
    if (!this.subjects) return;

    this.subjects.forEach(subject => {
      const subjectAssignments: Assignment[] = [
        {
          title: `TP 1: Introducción a ${subject.nombre}`,
          dueDate: '15/10/2024',
          status: 'Entregado',
          fileType: 'pdf'
        },
        {
          title: `TP 2: Desarrollo práctico de ${subject.nombre}`,
          dueDate: '30/10/2024',
          status: 'Pendiente',
          fileType: 'pdf'
        },
        {
          title: `TP 3: Proyecto final de ${subject.nombre}`,
          dueDate: '20/11/2024',
          status: 'Pendiente',
          fileType: 'excel'
        }
      ];
      this.allAssignments.set(subject.id, subjectAssignments);
    });
  }

  // Se ejecuta al hacer clic en una materia
  onSubjectClick(subject: Subjects): void {
    this.selectedSubjectId = subject.id;
    this.displayedAssignments = this.allAssignments.get(subject.id) || [];
  }

  // Normaliza el estado a minúsculas para usarlo en clases CSS y lógica
  getNormalizedStatus(status: 'Pendiente' | 'Entregado'): string {
    return status.toLowerCase();
  }

  // Tareas de cada materia - el backend va a traer esto  la materia (ELIMINADO, AHORA ES DINÁMICO)
  // assignments: Assignment[] = [];

  // Archivo seleccionado para subir
  selectedFile: File | null = null;

  // Propiedades para el diálogo de confirmación personalizado
  confirmationDialog = {
    visible: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  };

  // Cuando el usuario selecciona un archivo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const maxSizeInMB = 10;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      // Limpiamos el input para poder seleccionar el mismo archivo de nuevo si es necesario
      input.value = '';

      if (file.size > maxSizeInBytes) {
        this.showConfirmationDialog(
          `El archivo "${file.name}" pesa más de ${maxSizeInMB}MB. ¿Te gustaría comprimirlo?`,
          () => { // Acción si confirma (Aceptar)
            // Aquí se podría integrar una lógica o servicio de compresión de archivos.
            alert('La funcionalidad de compresión aún no está implementada. Por ahora, el archivo no se ha seleccionado.');
            this.selectedFile = null;
          },
          () => { // Acción si cancela
            this.selectedFile = file;
            console.log('Archivo seleccionado (sin comprimir):', this.selectedFile.name, `Tamaño: ${(this.selectedFile.size / 1024 / 1024).toFixed(2)} MB`);
          }
        );
        return; // Detenemos la ejecución para esperar la respuesta del diálogo
      }

      this.selectedFile = file;
      console.log('Archivo seleccionado:', this.selectedFile.name, `Tamaño: ${(this.selectedFile.size / 1024 / 1024).toFixed(2)} MB`);
    }
  }

  // Muestra el diálogo de confirmación
  showConfirmationDialog(message: string, onConfirm: () => void, onCancel: () => void) {
    this.confirmationDialog = {
      visible: true,
      message,
      onConfirm,
      onCancel
    };
  }

  // Oculta el diálogo y ejecuta la acción de confirmación
  confirmAction() {
    this.confirmationDialog.onConfirm();
    this.hideConfirmationDialog();
  }

  // Oculta el diálogo y ejecuta la acción de cancelación
  cancelAction() {
    this.confirmationDialog.onCancel();
    this.hideConfirmationDialog();
  }

  // Oculta el diálogo reseteando su estado
  hideConfirmationDialog() {
    this.confirmationDialog = { visible: false, message: '', onConfirm: () => {}, onCancel: () => {} };
  }

  // Agregar entrega (subir archivo)
  agregarEntrega(assignment: Assignment) {
    if (this.selectedFile) {
      console.log(`Subiendo archivo ${this.selectedFile.name} para ${assignment.title}`);
      // Acá el backend va a recibir el archivo y guardarlo
      alert(`Funcionalidad de subir archivo - el backend va a procesar: ${this.selectedFile.name}`);
      this.selectedFile = null;
    } else {
      alert('Seleccioná un archivo primero');
    }
  }

  // Quitar entrega
  quitarEntrega(assignment: Assignment) {
    console.log(`Quitando entrega de ${assignment.title}`);
    // Acá el backend va a eliminar la entrega
    alert(`Funcionalidad de quitar entrega - el backend va a eliminar la entrega de: ${assignment.title}`);
  }

  // Navegar al home/dashboard
  goToHome() {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.obtainDNIFromAuth();
    this.getUserData();
    this.getSubjects();
    this.getOnlyStudents();
    this.setCurrentRole();
  }

  private setCurrentRole(): void {
    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.currentRole = 'admin';
    } else if (this.authService.hasRole('ROLE_PROFESOR')) {
      this.currentRole = 'docente';
    } else {
      this.currentRole = 'estudiante';
    }
  }
}
