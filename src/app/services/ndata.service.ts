import { computed, Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NDataService {
  private readonly STORAGE_KEY = 'data';
  private readonly SCORES_KEY = 'scores';

  #ndata = signal<any | null>(null);
  readonly worldCupData = this.#ndata.asReadonly();

  // Scores separados — nunca tocan #ndata
  #baseScores = new Map<number, number>();
  #gamePoints = signal<Map<number, number>>(new Map());
  #groupPoints = signal<Map<number, number>>(new Map());
  #qualifiedPoints = signal<Map<number, number>>(new Map());
  #finalistPointsMap = signal<Map<number, Map<number, number>>>(new Map());

  private mapToArray(m: Map<number, number>): [number, number][] {
    return [...m.entries()];
  }

  private saveScores(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const finalistObj: Record<number, [number, number][]> = {};
    this.#finalistPointsMap().forEach((phaseMap, phase) => {
      finalistObj[phase] = this.mapToArray(phaseMap);
    });
    sessionStorage.setItem(this.SCORES_KEY, JSON.stringify({
      game: this.mapToArray(this.#gamePoints()),
      group: this.mapToArray(this.#groupPoints()),
      qualified: this.mapToArray(this.#qualifiedPoints()),
      finalist: finalistObj,
    }));
  }

  private restoreScores(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const raw = sessionStorage.getItem(this.SCORES_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.game) this.#gamePoints.set(new Map(saved.game));
    if (saved.group) this.#groupPoints.set(new Map(saved.group));
    if (saved.qualified) this.#qualifiedPoints.set(new Map(saved.qualified));
    if (saved.finalist) {
      const finalistMap = new Map<number, Map<number, number>>();
      Object.entries(saved.finalist).forEach(([phase, entries]) => {
        finalistMap.set(Number(phase), new Map(entries as [number, number][]));
      });
      this.#finalistPointsMap.set(finalistMap);
    }
  }

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

#selectedPlayerId = signal<number>(0);
readonly selectedPlayerId = this.#selectedPlayerId.asReadonly();
  readonly teamScorer = computed(() => this.#ndata()?.teamScorer ?? { idTeams: [], scorer_points: 40 });
  readonly teamsPositions = computed(() => this.#ndata()?.teamsPositions ?? []);
  readonly phases = computed(() => this.#ndata()?.phases ?? []);
  readonly teams = computed(() => this.#ndata()?.teams ?? []);
  readonly players = computed(() => this.#ndata()?.players ?? []);
  readonly games = computed(() => this.#ndata()?.games ?? []);
  readonly phaseUnlocked = computed(() => {
  const games = this.#ndata()?.games ?? [];
  
  // Fase 1 siempre desbloqueada
  const unlocked: Record<number, boolean> = { 1: true };

  // Para cada fase N, verifica que todos los juegos de fase N-1 tengan end_game: true
  [2, 3, 4, 5, 6].forEach(phase => {
    const prevGames = games.filter((g: any) => g.phase === phase - 1);
    unlocked[phase] = prevGames.length > 0 && prevGames.every((g: any) => g.end_game === true);
  });

  return unlocked;
});

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
    this.saveScores();
  }

  setGroupPoints(points: Map<number, number>) {
    this.#groupPoints.set(new Map(points));
    this.saveScores();
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
    this.saveScores();
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
    this.restoreScores();
    this.initBaseScores();
  }

updateFinals(teamsPositions: { id: number; idTeam: number }[], teamScorer: { idTeams: number[]; scorer_points: number }) {
  const current = this.#ndata();
  if (!current) return;
  this.#ndata.set({ ...current, teamsPositions, teamScorer });
}

  setFinalistPoints(phase: number, points: Map<number, number>) {
    const current = new Map(this.#finalistPointsMap());
    current.set(phase, new Map(points));
    this.#finalistPointsMap.set(current);
    this.saveScores();
  }

setSelectedPlayer(id: number) {
  this.#selectedPlayerId.set(id);
}
}