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

    // Verificar roles si se especifican en la ruta
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
      if (!this.authService.hasAnyRole(requiredRoles)) {
        this.router.navigate(['/acceso-denegado']);
        return false;
      }
    }

    return true;
  }
}