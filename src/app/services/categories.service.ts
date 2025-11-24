import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";

import { CategoriesListInterface } from "../interfaces/categories.list.interface";

@Injectable({
  providedIn: "root"
})

export class CategoriesService {

  private readonly categoriesUrl = "/api/categorias";

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoriesListInterface[]> {
    return this.http.get<CategoriesListInterface[]>(this.categoriesUrl).pipe(
      catchError((error) => {
        const mensaje =
          error.error?.mensaje ??
          error.message ??
          "Error desconocido al obtener categorías";

        return throwError(() => new Error(mensaje));
      })
    );
  }
}
