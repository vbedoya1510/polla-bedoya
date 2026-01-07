// src/app/services/data.service.ts
import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../shared/models/player.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  // El estado fuente (Data cruda)
  #data = signal<any | null>(null);

  // Señal que los componentes observarán
  readonly worldCupData = this.#data.asReadonly();

  // Selectores Reactivos
  readonly players = computed(() => this.#data()?.players ?? []);
  readonly games = computed(() => this.#data()?.games ?? []);
  
  // Ranking automático: siempre ordenado por puntos
  readonly ranking = computed(() => {
    return [...this.players()].sort((a, b) => b.total_score - a.total_score);
  });
  
  constructor(private http: HttpClient) {
    this.getData2();
  }

 getData(): Observable<any> {
    return this.http.get<any>('data.json');
 }

  getData2(): void {
    this.http.get<any>('data.json').subscribe(res => {
      this.#data.set(res);
    });
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

 updatePlayerScore(playerId: number, pointsToAdd: number) {
  this.#data.update(state => {
    if (!state) return null;

    // Creamos una nueva lista de jugadores con el puntaje actualizado
    const updatedPlayers = state.players.map((player: Player) => {
      if (player.id === playerId) {
        // Mantenemos inmutabilidad: creamos un nuevo objeto
        return { ...player, previous_score: player.total_score, total_score: player.total_score + pointsToAdd };
      }
      return player;
    });

    // Retornamos el nuevo estado completo
    return { ...state, players: updatedPlayers };
  });
}
}