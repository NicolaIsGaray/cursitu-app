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
  color: string;
}

@Component({
  selector: 'app-materias',
  imports: [CommonModule],
  templateUrl: './materias.html',
  styleUrl: './materias.css',
})
export class Materias {
  // Dropdown de "Materias" está expandido por defecto
  isSubjectsExpanded = true;

  // Lista de estudiantes
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

  // Lista de materias
  subjects: Subject[] = [
    { name: 'Sistemas Operativos', year: '2025', commission: 'A', color: 'red' },
    { name: 'Base de Datos', year: '2025', commission: 'A', color: 'gray' },
    { name: 'Programación Estructurada', year: '2025', commission: 'A', color: 'light-gray' },
  ];

  constructor(private router: Router) {}

  // Toggle del dropdown principal "Materias"
  toggleSubjectsDropdown() {
    this.isSubjectsExpanded = !this.isSubjectsExpanded;
  }

  // Click en una materia
  onSubjectClick(subject: Subject) {
    console.log(`Materia seleccionada: ${subject.name}`);
    // Acá el backend va a cargar los detalles de la materia
    alert(`Ver detalles de ${subject.name} - el backend va a cargar esto`);
  }

  // Navegar al home
  goToHome() {
    this.router.navigate(['/home']);
  }
}
