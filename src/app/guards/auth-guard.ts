import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Obtener roles requeridos
    const requiredRoles = this.getRequiredRoles(route);
    
    if (requiredRoles.length > 0) {
      const hasAccess = this.authService.hasAnyRole(requiredRoles);
      
      if (!hasAccess) {
        this.router.navigate(['/acceso-denegado']);
        return false;
      }
    }

    return true;
  }

  private getRequiredRoles(route: ActivatedRouteSnapshot): string[] {
    const routeData = route.data;
    
    if (routeData['roles'] && Array.isArray(routeData['roles'])) {
      return routeData['roles'];
    }
    
    if (routeData['role']) {
      return [routeData['role']];
    }
    
    return [];
  }
}