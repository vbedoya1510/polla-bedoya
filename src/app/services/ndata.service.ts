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
  #baseScores = signal(new Map<number, number>());
  #gamePoints = signal<Map<number, Map<number, number>>>(new Map());
  #groupPoints = signal<Map<number, number>>(new Map());
  #qualifiedPoints = signal<Map<number, Map<number, number>>>(new Map());
  #finalistPointsMap = signal<Map<number, Map<number, number>>>(new Map());
  // Estado locked de las posiciones finales al momento de la carga inicial
  #originalPositionsLocked = signal(false);

  private mapToArray(m: Map<number, number>): [number, number][] {
    return [...m.entries()];
  }

  private saveScores(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const gameObj: Record<number, [number, number][]> = {};
    this.#gamePoints().forEach((phaseMap, phase) => {
      gameObj[phase] = this.mapToArray(phaseMap);
    });
    const qualifiedObj: Record<number, [number, number][]> = {};
    this.#qualifiedPoints().forEach((phaseMap, phase) => {
      qualifiedObj[phase] = this.mapToArray(phaseMap);
    });
    const finalistObj: Record<number, [number, number][]> = {};
    this.#finalistPointsMap().forEach((phaseMap, phase) => {
      finalistObj[phase] = this.mapToArray(phaseMap);
    });
    sessionStorage.setItem(this.SCORES_KEY, JSON.stringify({
      game: gameObj,
      group: this.mapToArray(this.#groupPoints()),
      qualified: qualifiedObj,
      finalist: finalistObj,
    }));
  }

  private restoreScores(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const raw = sessionStorage.getItem(this.SCORES_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.game) {
      const gameMap = new Map<number, Map<number, number>>();
      Object.entries(saved.game).forEach(([phase, entries]) => {
        gameMap.set(Number(phase), new Map(entries as [number, number][]));
      });
      this.#gamePoints.set(gameMap);
    }
    if (saved.group) this.#groupPoints.set(new Map(saved.group));
    if (saved.qualified) {
      const qualMap = new Map<number, Map<number, number>>();
      Object.entries(saved.qualified).forEach(([phase, entries]) => {
        qualMap.set(Number(phase), new Map(entries as [number, number][]));
      });
      this.#qualifiedPoints.set(qualMap);
    }
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
  // Usar el estado locked de la carga inicial, no el actual (evita que ediciones de sesión anulen los puntos)
  const positionsLocked = this.#originalPositionsLocked();

  this.#baseScores().forEach((base: number, playerId: number) => {
    const games = [...this.#gamePoints().values()]
      .reduce((sum, phaseMap) => sum + (phaseMap.get(playerId) ?? 0), 0);
    const groups = this.#groupPoints().get(playerId) ?? 0;
    const qualified = [...this.#qualifiedPoints().values()]
      .reduce((sum, phaseMap) => sum + (phaseMap.get(playerId) ?? 0), 0);
    // Cuando las posiciones finales ya están cerradas en ndata (idTeam !== 0),
    // esos puntos ya están incluidos en total_score — no sumar de nuevo
    const finalist = positionsLocked ? 0 : [...this.#finalistPointsMap().values()]
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
        this.initBaseScores();
      }
    });
  }

  initBaseScores() {
    if (this.#baseScores().size > 0) return;
    const players = this.#ndata()?.players ?? [];
    if (!players.length) return;
    const newMap = new Map<number, number>();
    players.forEach((p: any) => newMap.set(p.id, p.total_score));
    this.#baseScores.set(newMap);
    // Capturar el estado locked de las posiciones tal como vienen del JSON original
    const positions = this.#ndata()?.teamsPositions ?? [];
    const locked = positions.length > 0 && positions.every((p: any) => p.idTeam !== 0);
    this.#originalPositionsLocked.set(locked);
  }

  setGamePoints(phase: number, points: Map<number, number>) {
    const current = new Map(this.#gamePoints());
    current.set(phase, new Map(points));
    this.#gamePoints.set(current);
    this.saveScores();
  }

  setGroupPoints(points: Map<number, number>) {
    this.#groupPoints.set(new Map(points));
    this.saveScores();
  }

  getPrediction(idPhase: number) {
    const phase = idPhase >= 1 && idPhase <= 6 ? idPhase : 1;
    return this.http.get<any>(`npredictionPhase${phase}.json`);
  }

  getData(): Observable<any> {
    return this.http.get<any>('ndata.json');
  }

  setQualifiedPoints(phase: number, points: Map<number, number>) {
    const current = new Map(this.#qualifiedPoints());
    current.set(phase, new Map(points));
    this.#qualifiedPoints.set(current);
    this.saveScores();
  }

  private clearCacheIfNewVersion(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('nuevaVersion') === 'true') {
      sessionStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.SCORES_KEY);
      params.delete('nuevaVersion');
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '');
      history.replaceState(null, '', newUrl);
    }
  }

  private initializeData(): void {
    this.clearCacheIfNewVersion();
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

resetSession(): void {
  if (!isPlatformBrowser(this.platformId)) return;
  sessionStorage.removeItem(this.STORAGE_KEY);
  sessionStorage.removeItem(this.SCORES_KEY);
  for (let phase = 1; phase <= 6; phase++) {
    sessionStorage.removeItem(`game_edits_phase_${phase}`);
    sessionStorage.removeItem(`group_edits_phase_${phase}`);
    sessionStorage.removeItem(`qualified_edits_phase_${phase}`);
  }
  sessionStorage.removeItem('positions_snapshot');
}
}