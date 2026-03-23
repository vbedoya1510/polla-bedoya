import { computed, Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NDataService {
  private readonly STORAGE_KEY = 'data';

  #ndata = signal<any | null>(null);
  readonly worldCupData = this.#ndata.asReadonly();

  // Scores separados — nunca tocan #ndata
  #baseScores = new Map<number, number>();
  #gamePoints = signal<Map<number, number>>(new Map());
  #groupPoints = signal<Map<number, number>>(new Map());
  #qualifiedPoints = signal<Map<number, number>>(new Map());
  #finalistPointsMap = signal<Map<number, Map<number, number>>>(new Map());

readonly playerTotalScores = computed(() => {
  const scores = new Map<number, number>();
  this.#baseScores.forEach((base, playerId) => {
    const games = this.#gamePoints().get(playerId) ?? 0;
    const groups = this.#groupPoints().get(playerId) ?? 0;
    const qualified = this.#qualifiedPoints().get(playerId) ?? 0;
    const finalist = [...this.#finalistPointsMap().values()]
      .reduce((sum, phaseMap) => sum + (phaseMap.get(playerId) ?? 0), 0);
    scores.set(playerId, base + games + groups + qualified + finalist);
  });
  return scores;
});

  readonly teamScorer = computed(() => this.#ndata()?.teamScorer ?? []);
  readonly teamsPositions = computed(() => this.#ndata()?.teamsPositions ?? []);
  readonly phases = computed(() => this.#ndata()?.phases ?? []);
  readonly teams = computed(() => this.#ndata()?.teams ?? []);
  readonly players = computed(() => this.#ndata()?.players ?? []);
  readonly games = computed(() => this.#ndata()?.games ?? []);

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: any) {
    this.initializeData();

    effect(() => {
      const currentData = this.#ndata();
      if (currentData && isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentData));
      }
    });
  }

  initBaseScores() {
    if (this.#baseScores.size > 0) return;
    const players = this.#ndata()?.players ?? [];
    if (!players.length) return;
    players.forEach((p: any) => this.#baseScores.set(p.id, p.total_score));
  }

  setGamePoints(points: Map<number, number>) {
    this.#gamePoints.set(new Map(points));
  }

  setGroupPoints(points: Map<number, number>) {
    this.#groupPoints.set(new Map(points));
  }

  getPrediction(idPhase: number) {
    const phase = idPhase >= 1 && idPhase <= 5 ? idPhase : 1;
    return this.http.get<any>(`npredictionPhase${phase}.json`);
  }

  getData(): Observable<any> {
    return this.http.get<any>('ndata.json');
  }

  setQualifiedPoints(points: Map<number, number>) {
    this.#qualifiedPoints.set(new Map(points));
  }

  private initializeData(): void {
    let savedData = null;
    if (isPlatformBrowser(this.platformId)) {
      savedData = sessionStorage.getItem(this.STORAGE_KEY);
    }
    if (savedData) {
      this.#ndata.set(JSON.parse(savedData));
    } else {
      this.http.get<any>('ndata.json').subscribe({
        next: (res) => this.#ndata.set(res),
        error: (err) => console.error('Error cargando JSON inicial', err)
      });
    }
  }

updateFinals(teamsPositions: { id: number; idTeam: number }[], teamScorer: { idTeam: number; scorer_points: number }) {
  const current = this.#ndata();
  if (!current) return;
  this.#ndata.set({ ...current, teamsPositions, teamScorer });
}

  setFinalistPoints(phase: number, points: Map<number, number>) {
    const current = new Map(this.#finalistPointsMap());
    current.set(phase, new Map(points));
    this.#finalistPointsMap.set(current);
}
}