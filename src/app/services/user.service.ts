import { inject, Injectable } from '@angular/core';
import { ApiUrlService } from './api-url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = inject(ApiUrlService);
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);

  getUsers(): Observable<User[]> {
    const url = `${this.apiUrl.buildUrl('/usuarios')}`;
    const token = this.authService.getToken();

    return this.httpClient.get<User[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getUserInfo(dni: string) {
    const url = `${this.apiUrl.buildUrl(`/user-info/${dni}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getUserByID(id: number): Observable<User> {
    const url = `${this.apiUrl.buildUrl(`/usuario/${id}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.get<User>(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  addUser(user: User): Observable<Object> {
    const url = `${this.apiUrl.buildUrl('/registrar-usuario')}`;
    return this.httpClient.post(url, user);
  }

  editUser(id: number, user: any) {
    const url = `${this.apiUrl.buildUrl(`/editar-usuario/${id}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.put(url, user, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  deleteUser(id: number): Observable<Object> {
    const url = `${this.apiUrl.buildUrl(`/eliminar-usuario/${id}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.delete(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  assignSubjectToTeacher(payload: any): Observable<Object> {
    const url = `${this.apiUrl.buildUrl('/asignar-materia')}`;
    const token = this.authService.getToken();

    return this.httpClient.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  confirmTeacherRequest(id: number) {
    const url = `${this.apiUrl.buildUrl(`/confirmar-rol/${id}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.put(url, id, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  denyTeacherRequest(id: number) {
    const url = `${this.apiUrl.buildUrl(`/denegar-rol/${id}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.put(url, id, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  constructor() {}
}
