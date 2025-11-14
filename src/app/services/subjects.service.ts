import { inject, Injectable } from '@angular/core';
import { ApiUrlService } from './api-url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Subjects } from '../models/subjects';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {
  private apiUrl = inject(ApiUrlService);
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);

  getSubjects(): Observable<Subjects[]> {
    const url = `${this.apiUrl.buildUrl('/materias')}`;
    const token = this.authService.getToken();

    return this.httpClient.get<Subjects[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getSubjectByID(id: number) {
    const url = `${this.apiUrl.buildUrl(`/materias/${id}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.get<Subjects>(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  addSubject(subject: Subjects): Observable<Object> {
    const url = `${this.apiUrl.buildUrl('/agregar-materia')}`;
    const token = this.authService.getToken();

    return this.httpClient.post(url, subject, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  deleteSubject(id: number): Observable<Object> {
    const url = `${this.apiUrl.buildUrl(`/eliminar-materia/${id}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.delete(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  constructor() {}
}
