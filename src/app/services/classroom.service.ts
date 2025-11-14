import { inject, Injectable } from '@angular/core';
import { ApiUrlService } from './api-url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Classroom } from '../models/classroom';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ClassroomService {
  private apiUrl = inject(ApiUrlService);
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);

  getClassrooms(): Observable<Classroom[]> {
    const url = `${this.apiUrl.buildUrl('/cursos')}`;
    const token = this.authService.getToken();

    return this.httpClient.get<Classroom[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  addClassroom(classroom: any): Observable<Object> {
    const url = `${this.apiUrl.buildUrl('/crear-curso')}`;
    const token = this.authService.getToken();

    return this.httpClient.post(url, classroom, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  modifyClassroom(id: number, classroom: Classroom) {
    const url = `${this.apiUrl.buildUrl(`/editar-curso/${id}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.put(url, classroom ,{
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  deleteClassroom(id: number): Observable<Object> {
    const url = `${this.apiUrl.buildUrl(`/eliminar-curso/${id}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.delete(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}
