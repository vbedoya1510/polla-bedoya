// src/app/services/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get<any>('data.json');
  }

  getPrediction(idPhase: number): Observable<any> {
    switch(idPhase){
     case 1:
      return this.http.get<any>('predictionPhase1.json');
    case 2:
      return this.http.get<any>('predictionPhase2.json');
    case 3:
      return this.http.get<any>('predictionPhase3.json');
    case 4:
      return this.http.get<any>('predictionPhase4.json');
    case 5:
      return this.http.get<any>('predictionPhase5.json');
    default:
      return this.http.get<any>('predictionPhase1.json');
    }
  }
}