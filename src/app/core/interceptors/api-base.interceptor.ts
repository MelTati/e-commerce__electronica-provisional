// src/app/core/interceptors/api-base.interceptor.ts

import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http'; 
import { PLATFORM_ID, inject } from '@angular/core'; 

// URL de la API de Rust, codificada aquí
const PROD_API_BASE_URL = 'https://smartpoint-api.onrender.com';

// ⚠️ Definimos el Interceptor como una función
export const ApiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  
  // Obtenemos PLATFORM_ID usando la función 'inject'
  const platformId = inject(PLATFORM_ID); 

  // 1. Verificación de entorno: ¿Estamos en el servidor (SSR)?
  if (isPlatformServer(platformId) && req.url.startsWith('/api')) {
    
    // 2. Construye la URL completa anteponiendo la URL base.
    const newUrl = PROD_API_BASE_URL + req.url;
    
    req = req.clone({
      url: newUrl
    });
    
    console.log(`SSR (Fetch compatible): Redirigiendo petición a ${newUrl}`);
  } 
  
  // Pasamos la petición al siguiente manejador
  return next(req);
};