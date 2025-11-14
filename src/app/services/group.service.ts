import { inject, Injectable } from '@angular/core';
import { ApiUrlService } from './api-url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../models/group';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private apiUrl = inject(ApiUrlService);
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);

  getGroups(): Observable<Group[]> {
    const url = `${this.apiUrl.buildUrl('/grupos')}`;
    const token = this.authService.getToken();

    return this.httpClient.get<Group[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  createGroup(group: Group): Observable<Object> {
    const url = `${this.apiUrl.buildUrl('/crear-grupo')}`;
    const token = this.authService.getToken();

    return this.httpClient.post(url, group, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  modifyGroup(id: number, group: Group) {
    const url = `${this.apiUrl.buildUrl(`/editar-grupo/${id}`)}`;
    return this.httpClient.put(url, group);
  }

  deleteGroup(id: number): Observable<Object> {
    const url = `${this.apiUrl.buildUrl(`/eliminar-grupo/${id}`)}`;
    const token = this.authService.getToken();

    return this.httpClient.delete(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  constructor() {}
}
