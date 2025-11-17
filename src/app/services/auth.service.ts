import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../environment/environment';

export interface LoginResponse {
  token: string;
  Message: string;
  Username: string;
}

export interface User {
  username: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTokenFromStorage();
  }

  // Login
  login(dni: string, clave: string): Observable<LoginResponse> {
  const loginData = { dni, clave };
  
  return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData)
    .pipe(
      tap(response => {
        console.log('Login exitoso, token recibido');
        this.setToken(response.token);
        this.decodeAndSetUser(response.token);
      }),
      catchError(error => {
        console.error('Error completo:', error);
        console.error('Status:', error.status);
        console.error('URL:', error.url);
        return throwError(() => error);
      })
    );
}

  // Registro
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar-usuario`, userData);
  }

  // Guardar token y decodificar usuario
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private decodeAndSetUser(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Aseguramos que los roles se procesen siempre como un array de strings en mayúsculas.
      const rolesArray = (payload.roles || [])
        .map((role: any) => (typeof role === 'object' && role.role ? role.role : role))
        .filter((role: any) => typeof role === 'string')
        .map((role: string) => role.toUpperCase());

      const user: User = {
        username: payload.sub,
        roles: rolesArray
      };
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  // Cargar token del localStorage al iniciar la app
  private loadTokenFromStorage(): void {
    const token = this.getToken();
    if (token) {
      this.decodeAndSetUser(token);
    }
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar expiración del token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000;
      return Date.now() < expiration;
    } catch (error) {
      return false;
    }
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Verificar roles
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.some(role => user.roles.includes(role));
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }
}