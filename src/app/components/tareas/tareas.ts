import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Interfaz para los estudiantes
interface Student {
  initial: string;
  name: string;
  isActive: boolean;
}

// Interfaz para las materias
interface Subject {
  name: string;
  year: string;
  commission: string;
  color: string; // 'red', 'gray', 'light-gray'
  isExpanded: boolean;
}

// Interfaz para las tareas/trabajos prácticos
interface Assignment {
  title: string;
  dueDate: string;
  status: 'pendiente' | 'entregado';
  fileType: 'pdf' | 'excel';
}

@Component({
  selector: 'app-tareas',
  imports: [CommonModule],
  templateUrl: './tareas.html',
  styleUrl: './tareas.css',
})
export class Tareas {
  // Dropdown de "Tareas" está expandido por defecto
  isTasksExpanded = true;

  // Lista de estudiantes (misma que en home)
  students: Student[] = [
    { initial: 'A', name: 'Pedro Sanchez', isActive: true },
    { initial: 'A', name: 'Ken Masters', isActive: true },
    { initial: 'A', name: 'Joaquin Diaz', isActive: true },
    { initial: 'A', name: 'Nicolas Martinez', isActive: false },
    { initial: 'A', name: 'Victoria Celeste', isActive: true },
    { initial: 'A', name: 'Diego Correa', isActive: false },
    { initial: 'A', name: 'Lucy Steel', isActive: false },
    { initial: 'A', name: 'Ivan Vanko', isActive: false },
    { initial: 'A', name: 'Franco Polo', isActive: false },
    { initial: 'A', name: 'Florencia Rojas', isActive: false },
    { initial: 'A', name: 'Santiago Perez', isActive: true },
    { initial: 'A', name: 'Juan Pablo', isActive: true },
  ];

  // Lista de materias con sus tareas - el backend va a traer esto
  subjects: Subject[] = [
    { name: 'Sistemas Operativos', year: '2025', commission: 'A', color: 'red', isExpanded: true },
    { name: 'Base de Datos', year: '2025', commission: 'A', color: 'gray', isExpanded: false },
    { name: 'Programación Estructurada', year: '2025', commission: 'A', color: 'light-gray', isExpanded: false },
  ];

  // Tareas de cada materia - el backend va a traer esto  la materia
  assignments: Assignment[] = [
    { title: 'TP 1 - Comandos básicos Linux', dueDate: '08/11/2025', status: 'pendiente', fileType: 'pdf' },
    { title: 'TP 2 - Comandos básicos Windows', dueDate: '15/11/2025', status: 'entregado', fileType: 'pdf' },
  ];

  // Archivo seleccionado para subir
  selectedFile: File | null = null;

  constructor(private router: Router) {}

  // Toggle del dropdown principal "Tareas"
  toggleTasksDropdown() {
    this.isTasksExpanded = !this.isTasksExpanded;
  }

  // Toggle de cada materia
  toggleSubject(subject: Subject) {
    subject.isExpanded = !subject.isExpanded;
    console.log(`Materia ${subject.name} expandida: ${subject.isExpanded}`);
    // Acá el backend va a cargar las tareas de esta materia
  }

  // Cuando el usuario selecciona un archivo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Archivo seleccionado:', this.selectedFile.name);
    }
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
}
