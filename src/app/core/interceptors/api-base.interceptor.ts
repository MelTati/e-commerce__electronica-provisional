// core/interceptors/api-base.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL } from '../api-config'; 

export const ApiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  
  if (
    !req.url.startsWith('http://') && 
    !req.url.startsWith('https://') 
  ) {
    
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const path = req.url.startsWith('/') ? req.url : '/' + req.url;

    const newUrl = baseUrl + path;

    req = req.clone({
      url: newUrl
    });
  }

  return next(req);
};