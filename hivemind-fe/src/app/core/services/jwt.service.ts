import { Injectable } from '@angular/core';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { JwtPairDto } from '@core/dto';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  static readonly JWT_PAIR_STORAGE_KEY = 'hm-jwt-pair';

  getJwtPair(): JwtPairDto | null {
    const storage = this.isPersistent() ? localStorage : sessionStorage;
    const jwtPair = storage.getItem(JwtService.JWT_PAIR_STORAGE_KEY);
    return jwtPair ? JSON.parse(jwtPair) : null;
  }

  saveJwtPair(
    jwtPair: JwtPairDto,
    persistent: boolean = this.isPersistent()
  ): void {
    const storage = persistent ? localStorage : sessionStorage;
    this.clearJwtPair();
    storage.setItem(JwtService.JWT_PAIR_STORAGE_KEY, JSON.stringify(jwtPair));
  }

  clearJwtPair(): void {
    localStorage.removeItem(JwtService.JWT_PAIR_STORAGE_KEY);
    sessionStorage.removeItem(JwtService.JWT_PAIR_STORAGE_KEY);
  }

  isJwtExpired(jwt: string): boolean {
    try {
      const decoded: JwtPayload = jwtDecode(jwt);
      const expirationDate = decoded.exp! * 1000;
      return expirationDate < Date.now();
    } catch {
      return true;
    }
  }

  isPersistent(): boolean {
    return localStorage.getItem(JwtService.JWT_PAIR_STORAGE_KEY) !== null;
  }

  getSub(): string | null {
    const jwtPair = this.getJwtPair();
    return jwtPair
      ? jwtDecode<JwtPayload>(jwtPair.accessToken).sub || null
      : null;
  }
}
