import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductDetailDTO } from '../interfaces/ProductDetail.interface';

@Injectable({
  providedIn: 'root'
})

export class ProductDetailService {

  private baseUrl = '/api/productos';

  constructor(private http: HttpClient) {}

  getProductDetailsById(id: number): Observable<ProductDetailDTO> {
    return this.http.get<ProductDetailDTO>(`${this.baseUrl}/${id}`);
  }

}
