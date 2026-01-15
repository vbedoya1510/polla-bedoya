import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AuthService {

    private platformId = inject(PLATFORM_ID);
    isLoggedIn = signal(this.getInitialStatus());

    registerLogin(status: boolean) {
        this.isLoggedIn.set(status);
    }

    logOut() {
        if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem('login', 'false');
        }
    }

    private getInitialStatus(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem('login') === 'true';
    }
    return false;
  }
}