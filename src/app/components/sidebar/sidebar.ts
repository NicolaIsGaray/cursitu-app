import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Tipos de rol disponibles en la app
// BACKEND: Este tipo debe coincidir con los roles que devuelve el endpoint de autenticacion
// GET /api/auth/me -> { role: 'estudiante' | 'docente' | 'admin' }
export type UserRole = 'estudiante' | 'docente' | 'admin';

// Interface para los items de navegacion
interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: UserRole[]; // Roles que pueden ver este item
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  // Rol del usuario actual - el componente padre lo pasa
  // BACKEND: Este valor deberia venir del token JWT o sesion del usuario
  @Input() currentRole: UserRole = 'estudiante';

  // Estado del sidebar (colapsado/expandido)
  isCollapsed = false;

  // Items de navegacion con sus roles permitidos
  // BACKEND: Estos items deben coincidir con las rutas protegidas del backend
  navItems: NavItem[] = [
    // Comunes a todos
    { label: 'Inicio', route: '/home', icon: 'home', roles: ['estudiante', 'docente', 'admin'] },
    { label: 'Materias', route: '/materias', icon: 'book', roles: ['estudiante', 'docente', 'admin'] },

    // Solo estudiantes
    { label: 'Tareas', route: '/tareas', icon: 'clipboard', roles: ['estudiante'] },
    { label: 'Grupos', route: '/grupos', icon: 'users', roles: ['estudiante'] },

    // Solo docentes
    { label: 'Mis Tareas', route: '/tareas-docente', icon: 'file-text', roles: ['docente'] },
    { label: 'Notificaciones', route: '/notificaciones-docente', icon: 'bell', roles: ['docente'] },

    // Solo admin
    { label: 'Administracion', route: '/administrador', icon: 'settings', roles: ['admin'] },

    // Perfil - comun a todos
    { label: 'Perfil', route: '/perfil', icon: 'user', roles: ['estudiante', 'docente', 'admin'] },
  ];

  // Filtra los items segun el rol actual
  get visibleItems(): NavItem[] {
    return this.navItems.filter(item => item.roles.includes(this.currentRole));
  }

  // Toggle del sidebar
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Obtener el titulo segun el rol
  get roleTitle(): string {
    const titles: Record<UserRole, string> = {
      estudiante: 'Estudiante',
      docente: 'Docente',
      admin: 'Administrador',
    };
    return titles[this.currentRole];
  }
}
