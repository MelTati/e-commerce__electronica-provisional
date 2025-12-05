import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL } from '../api-config'; 

export const ApiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  
  if (req.url.startsWith('/api')) {

    const newUrl = API_BASE_URL + req.url;
    
    req = req.clone({
      url: newUrl
    });
  }

  return next(req);
};