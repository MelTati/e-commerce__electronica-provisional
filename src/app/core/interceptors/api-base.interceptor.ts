// src/app/core/interceptors/api-base.interceptor.ts

import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http'; 
import { PLATFORM_ID, inject } from '@angular/core'; 

// ⚠️ MODIFICACIÓN CLAVE: Leer la variable de entorno de Vercel/Node.js
const PROD_API_BASE_URL = typeof process !== 'undefined' && process.env['API_BASE_URL']
  ? process.env['API_BASE_URL']
  : 'https://smartpoint-api.onrender.com'; // Fallback si no está definida

export const ApiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  
  const platformId = inject(PLATFORM_ID); 

  // 1. Verificación de entorno: ¿Estamos en el servidor (SSR)?
  // Eliminamos el console.log para reducir posibles fallos de runtime
  if (isPlatformServer(platformId) && req.url.startsWith('/api')) {
    
    // 2. Construye la URL completa anteponiendo la URL base.
    const newUrl = PROD_API_BASE_URL + req.url;
    
    req = req.clone({
      url: newUrl
    });
  } 
  
  // Pasamos la petición al siguiente manejador
  return next(req);
};