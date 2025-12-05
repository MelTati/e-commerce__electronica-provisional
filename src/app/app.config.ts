// app/app.config.ts (Versión final)

import { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

// 🔑 CAMBIO: Usamos withFetch y withInterceptors
import { 
  provideHttpClient, 
  withFetch, 
  withInterceptors // ⬅️ Usado para registrar Interceptores funcionales
} from '@angular/common/http'; 

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';

// 🔑 IMPORTA LA FUNCIÓN INTERCEPTOR
import { ApiBaseInterceptor } from './core/interceptors/api-base.interceptor'; 


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // 🔑 AHORA AMBOS TRABAJAN JUNTOS:
    provideHttpClient(
      withFetch(), 
      withInterceptors([ApiBaseInterceptor]) 
    ), 
  ]
};