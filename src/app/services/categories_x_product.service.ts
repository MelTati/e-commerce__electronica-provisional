import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { CategoriesXProductDTO } from "../interfaces/categories_x_product.interface";

@Injectable({
  providedIn: "root"
})

export class CategoriesXProductService {

  private readonly baseUrl = "/api/categorias";

  constructor(private http: HttpClient) {}

  getCategoriesXProduct(id: number): Observable<CategoriesXProductDTO[]> {
    const url = `${this.baseUrl}/${id}/productos`;

    return this.http.get<CategoriesXProductDTO[]>(url).pipe(
      catchError((error) => {
        const mensaje =
          error.error?.mensaje ??
          error.message ??
          "Error desconocido al obtener categorías por producto";
        return throwError(() => new Error(mensaje));
      })
    );
  }

}
