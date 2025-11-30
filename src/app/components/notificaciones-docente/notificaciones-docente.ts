import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Sidebar, UserRole } from '../sidebar/sidebar';
import { AuthService } from '../../services/auth.service';

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
  isSelected: boolean;
}

@Component({
  selector: 'app-notificaciones-docente',
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './notificaciones-docente.html',
  styleUrl: './notificaciones-docente.css',
})
export class NotificacionesDocente {
  // Rol del usuario para el sidebar
  currentRole: UserRole = 'docente';
  // Dropdown de "Notificaciones" está expandido por defecto
  isNotificationsExpanded = true;

  // Campos del formulario
  notificationHeader = '';
  notificationBody = '';

  // Destinatarios seleccionados
  sendToAll = false;
  sendToCommissions = false;
  sendToGroups = false;
  sendToStudents = false;

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
    { name: 'Sistemas Operativos', year: '2025', color: 'red', isExpanded: true, isSelected: true },
  ];

  constructor(private router: Router) {}

  // Toggle del dropdown principal "Notificaciones"
  toggleNotificationsDropdown() {
    this.isNotificationsExpanded = !this.isNotificationsExpanded;
  }

  // Toggle de cada materia
  toggleSubject(subject: Subject) {
    subject.isExpanded = !subject.isExpanded;
  }

  // Crear notificación
  crearNotificacion() {
    console.log('Creando notificación:', {
      encabezado: this.notificationHeader,
      cuerpo: this.notificationBody,
      destinatarios: {
        todos: this.sendToAll,
        comisiones: this.sendToCommissions,
        grupos: this.sendToGroups,
        alumnos: this.sendToStudents,
      },
    });
    // Acá el backend va a:
    // POST /api/docente/notificaciones
    // Body: { encabezado, cuerpo, destinatarios }
    alert('Funcionalidad de crear notificación - el backend va a procesar esto');
  }

  // Ver notificaciones
  verNotificaciones() {
    console.log('Viendo notificaciones');
    // Acá el backend va a:
    // GET /api/docente/notificaciones
    alert('Funcionalidad de ver notificaciones - el backend va a traer las notificaciones');
  }

  // Eliminar notificación
  eliminarNotificacion() {
    console.log('Eliminando notificación');
    // Acá el backend va a:
    // DELETE /api/docente/notificaciones/{id}
    alert('Funcionalidad de eliminar notificación - el backend va a eliminar esto');
  }

  // Navegar al home
  goToHome() {
    this.router.navigate(['/home']);
  }
}
