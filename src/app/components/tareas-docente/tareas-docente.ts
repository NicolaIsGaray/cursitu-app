import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  color: string;
  isExpanded: boolean;
}

@Component({
  selector: 'app-tareas-docente',
  imports: [CommonModule, FormsModule],
  templateUrl: './tareas-docente.html',
  styleUrl: './tareas-docente.css',
})
export class TareasDocente {
  // Dropdown de "Tareas" está expandido por defecto
  isTasksExpanded = true;

  // Datos del formulario de subir tarea
  taskTitle = 'TP 1 - Comandos básicos Linux';
  dueDate = '2025-11-08';
  selectedCourse = '2°';
  selectedCommission = 'A';
  isGroupTask = true;

  // Lista de estudiantes en el sidebar
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

  // Lista de materias del docente
  subjects: Subject[] = [
    { name: 'Sistemas Operativos', year: '2025', color: 'red', isExpanded: true },
  ];

  // Cursos disponibles
  courses = ['1°', '2°', '3°', '4°', '5°'];

  // Comisiones disponibles
  commissions = ['A', 'B', 'C', 'D'];

  constructor(private router: Router) {}

  // Toggle del dropdown principal "Tareas"
  toggleTasksDropdown() {
    this.isTasksExpanded = !this.isTasksExpanded;
  }

  // Toggle de cada materia
  toggleSubject(subject: Subject) {
    subject.isExpanded = !subject.isExpanded;
    console.log(`Materia ${subject.name} expandida: ${subject.isExpanded}`);
  }

  // Subir tarea
  subirTarea() {
    console.log('Subiendo tarea:', {
      titulo: this.taskTitle,
      fechaEntrega: this.dueDate,
      curso: this.selectedCourse,
      comision: this.selectedCommission,
      esGrupal: this.isGroupTask,
    });
    // Acá el backend va a:
    // POST /api/docente/tareas
    // Body: { titulo, fechaEntrega, curso, comision, esGrupal, archivoAdjunto }
    alert('Funcionalidad de subir tarea - el backend va a procesar esto');
  }

  // Navegar al home del docente
  goToHome() {
    // Acá debería ir al dashboard del docente (cuando lo creemos)
    this.router.navigate(['/home']);
  }
}
