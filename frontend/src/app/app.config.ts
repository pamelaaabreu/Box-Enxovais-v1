import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask';
import Swal from 'sweetalert2';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './core/auth.interceptor';
import {
  LucideAngularModule,
  Check,
  X,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-angular';
import { AuthService } from './core/services/auth.service';

export function initializeAuth(authService: AuthService) {
  return () => authService.loadUser();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideNgxMask(),
    provideAnimationsAsync(),
    { provide: 'Swal', useValue: Swal },
    { provide: HTTP_INTERCEPTORS, useValue: authInterceptor, multi: true },
    importProvidersFrom(
      LucideAngularModule.pick({
        Check,
        X,
        AlertTriangle,
        Info,
        Loader2,
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};
