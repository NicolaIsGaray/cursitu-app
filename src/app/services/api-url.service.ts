import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiUrlService {
  getBaseUrl(): string {
    return environment.apiUrl;
  }

  buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${this.getBaseUrl()}/${cleanEndpoint}`;
  }
}
