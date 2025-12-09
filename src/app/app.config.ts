// app/app.config.ts 

import { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { 
  provideHttpClient, 
  withFetch, 
  withInterceptors
} from '@angular/common/http'; 

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
import { ApiBaseInterceptor } from './core/interceptors/api-base.interceptor'; 


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(), 
      withInterceptors([ApiBaseInterceptor]) 
    ), 
  ]
};