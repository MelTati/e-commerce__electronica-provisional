import { isPlatformBrowser, isPlatformServer } from '@angular/common'; // Importar isPlatformBrowser
import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';

// ⚠️ MODIFICACIÓN CLAVE: Leer la variable de entorno de Vercel/Node.js
// Esta variable DEBE estar configurada en Vercel como una variable de entorno.
const PROD_API_BASE_URL = typeof process !== 'undefined' && process.env['API_BASE_URL']
  ? process.env['API_BASE_URL']
  : 'https://smartpoint-api.onrender.com'; // Fallback si no está definida

export const ApiBaseInterceptor: HttpInterceptorFn = (req, next) => {

  const platformId = inject(PLATFORM_ID);
  
  // Condición Unificada: Aplicamos el cambio si la URL es relativa (/api/...)
  // y estamos en el SERVIDOR o en el NAVEGADOR (producción).
  if (req.url.startsWith('/api')) {

    let newUrl: string;

    if (isPlatformServer(platformId) || isPlatformBrowser(platformId)) {
        // Para SSR (Servidor) y Navegador (Producción en Vercel)
        // Usamos la URL absoluta de la variable de entorno.
        newUrl = PROD_API_BASE_URL + req.url;
    } else {
        // En un entorno de desarrollo local (ng serve) con proxy.conf.json
        // dejamos la URL relativa para que el proxy funcione.
        // Si no usas proxy, esta rama nunca debería ejecutarse en desarrollo.
        newUrl = req.url;
    }
    
    // Si la nueva URL es diferente, clonamos la petición.
    if (newUrl !== req.url) {
        req = req.clone({
            url: newUrl
        });
    }
  }

  // Pasamos la petición al siguiente manejador
  return next(req);
};