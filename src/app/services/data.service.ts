import { computed, Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Player } from '../shared/models/player.model';
import { Observable } from 'rxjs';
import { PredictionGame } from '../shared/models/team.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly STORAGE_KEY = 'data';

  // 1. Estado privado con Signal
  #data = signal<any | null>(null);
  readonly worldCupData = this.#data.asReadonly();

  // 2. Selectores públicos
  readonly players = computed(() => this.#data()?.players ?? []);
  readonly games = computed(() => this.#data()?.games ?? []);
  readonly ranking = computed(() => {
    return [...this.players()].sort((a, b) => b.total_score - a.total_score);
  });

  constructor(private http: HttpClient) {
    this.initializeData();

    // 3. Efecto automático: Cada vez que #data cambie, se guarda en SessionStorage
    effect(() => {
      const currentData = this.#data();
      if (currentData) {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentData));
      }
    });
  }

  private initializeData(): void {
    const savedData = sessionStorage.getItem(this.STORAGE_KEY);

    if (savedData) {
      // Si existe en SessionStorage, lo cargamos de una vez
      this.#data.set(JSON.parse(savedData));
    } else {
      // Si no, vamos al JSON original
      this.http.get<any>('data.json').subscribe({
        next: (res) => this.#data.set(res),
        error: (err) => console.error('Error cargando JSON inicial', err)
      });
    }
  }

  // 4. Actualización Reactiva e Inmutable
  updatePlayerScore(playerId: number, pointsToAdd: number) {
    this.#data.update(state => {
      if (!state) return null;

      const updatedPlayers = state.players.map((player: Player) => 
        player.id === playerId 
          ? { ...player, previous_score: player.total_score, total_score: player.total_score + pointsToAdd }
          : player
      );

      return { ...state, players: updatedPlayers };
    });
  }

  // Centralizar predicciones (Refactorizado con Template Strings)
  getPrediction(idPhase: number) {
    const phase = idPhase >= 1 && idPhase <= 5 ? idPhase : 1;
    return this.http.get<any>(`predictionPhase${phase}.json`);
  }

  getData(): Observable<any> {
    return this.http.get<any>('data.json');
 }

// En data.service.ts
setPlayerAbsoluteScore(playerId: number, newTotal: number) {
  // Solo actualizamos si el valor realmente cambió
  const currentData = this.#data();
  const player = currentData.players.find((p: any) => p.id === playerId);
  
  if (player && player.total_score === newTotal) return;

  this.#data.update(state => {
    if (!state) return null;
    return {
      ...state,
      players: state.players.map((p: any) => 
        p.id === playerId ? { ...p, total_score: newTotal } : p
      )
    };
  });
}
}