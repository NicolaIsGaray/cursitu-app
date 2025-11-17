import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Home } from './components/home/home';
import { Tareas } from './components/tareas/tareas';
import { Grupos } from './components/grupos/grupos';
import { TareasDocente } from './components/tareas-docente/tareas-docente';
import { NotificacionesDocente } from './components/notificaciones-docente/notificaciones-docente';
import { Materias } from './components/materias/materias';
import { Administrador } from './components/administrador/administrador';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
    // Rutas comunes
    {path: "login", component: Login},
    {path: "register", component: Register},
    {path: "home", component: Home, canActivate: [AuthGuard]},

    // Rutas de Estudiante
    {path: "tareas", component: Tareas, canActivate: [AuthGuard]},
    {path: "grupos", component: Grupos, canActivate: [AuthGuard]},

    // Rutas de Docente
    {path: "tareas-docente", component: TareasDocente, canActivate: [AuthGuard], data: { roles: ['ROLE_PROFESOR', 'ROLE_ADMIN'] }},
    {path: "notificaciones-docente", component: NotificacionesDocente, canActivate: [AuthGuard], data: { roles: ['ROLE_PROFESOR', 'ROLE_ADMIN'] }},

    // Rutas Multi-Rol
    {path: "materias", component: Materias, canActivate: [AuthGuard]},

    // Rutas de Administrador
    {path: "administrador", component: Administrador, canActivate: [AuthGuard], data: { roles: ['ROLE_ADMIN'] }},

    // Redirect por defecto
    {path: "", pathMatch: 'full', redirectTo: "home"},
    {path: '**', redirectTo: 'home'}
];
