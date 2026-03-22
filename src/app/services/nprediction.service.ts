import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly STORAGE_PREFIX = 'prediction';

  constructor(private http: HttpClient) {}

  // Cargar todas las predicciones desde el archivo único
  private loadPrediction(phase: number): Observable<any> {
    return this.http.get<any>(`npredictionPhase${phase}.json`).pipe(
      tap(res => {
        // Guardamos directamente la predicción de esa fase
        console.log(`Guardando predicción de la fase ${phase} en localStorage`);
        localStorage.setItem(`${this.STORAGE_PREFIX}${phase}`, JSON.stringify(res));
      })
    );
  }


  getPrediction(phase: number): Observable<any> {
    const key = `${this.STORAGE_PREFIX}${phase}`;
    const savedData = localStorage.getItem(key);

    console.log(`Cargando predicción de la fase ${phase} de localStorage`);

    if (savedData) {
      console.log(`Predicción de la fase ${phase} encontrada en localStorage.`);
      console.log(`Datos de la fase ${phase}:`, JSON.parse(savedData));
      return of(JSON.parse(savedData));
    } else {
      console.log(`No se encontró predicción de la fase ${phase} en localStorage. Cargando desde JSON...`);
      return this.loadPrediction(phase);
    }
  }


  // Limpiar una predicción específica
  clearPrediction(phase: number): void {
    localStorage.removeItem(`${this.STORAGE_PREFIX}${phase}`);
  }

  // Limpiar todas las predicciones
  clearAllPredictions(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.STORAGE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
}
