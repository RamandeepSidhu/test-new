import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FacebookAuthService {
  private accessToken: string = '';

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string {
    return this.accessToken;
  }
}
