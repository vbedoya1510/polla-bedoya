import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { Game } from '../../shared/models/game.model';
import { Player } from '../../shared/models/player.model';
import { NPredictionGame, NPredictionTeam } from '../../shared/models/team.model';
import { Phase } from '../../shared/models/phase.model';
import { NDataService } from '../../services/ndata.service';

interface GameRow {
  game: Game;
  edited: boolean;
  editableGoals1: number;
  editableGoals2: number;
  playerPredictions: {
    player: Player;
    prediction: NPredictionGame | undefined;
    points: number;
    matchType: 'exact' | 'winner' | 'goal' | 'none';
  }[];
}

@Component({
  selector: 'app-nresults-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nresults-table.html',
  styleUrls: ['./nresults-table.css'],
})
export class NresultsTable implements OnInit, OnChanges, OnDestroy {
  @Input() games: Game[] = [];
  @Input() players: Player[] = [];
  @Input() predictionsGame: NPredictionGame[] = [];
  @Input() phase?: Phase;

  gameRows: GameRow[] = [];
  playerScores: Map<number, number> = new Map();
  phaseScores: Map<number, number> = new Map();

  private scoreChange$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(public dataService: NDataService) { }

  ngOnInit() {
    this.scoreChange$
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.persistScores();
        this.saveEditsToStorage();
      });
  }

  ngOnDestroy() {
    this.saveEditsToStorage();
    this.persistScores();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    const allReady = this.games.length > 0
      && this.players.length > 0
      && this.predictionsGame.length > 0
      && this.phase;

    if (allReady) {
      this.buildTable();
    }
  }



private buildTable() {
  this.players.forEach(p => this.playerScores.set(p.id, 0));
  this.gameRows = this.games.map(game => ({
    game,
    edited: false,
    editableGoals1: game.goals_team1,
    editableGoals2: game.goals_team2,
    playerPredictions: this.players.map(player => {
      const prediction = this.predictionsGame.find(
        p => p.idPlayer === player.id && p.idGame === game.id
      );
      const { points, matchType } = this.calculatePoints(
        game.goals_team1, 
        game.goals_team2, 
        prediction, 
        game.end_game || game.team_qualified !== 0
      );
      return { player, prediction, points, matchType };
    })
  }));
  this.recalculateAllScores();
  this.restoreEditsFromStorage(); // <-- al final
}

  private calculatePoints(
    realG1: number,
    realG2: number,
    prediction: NPredictionGame | undefined,
    shouldCalculate: boolean
  ): { points: number, matchType: 'exact' | 'winner' | 'goal' | 'none' } {
    if (!prediction || !this.phase || !shouldCalculate) {
      return { points: 0, matchType: 'none' };
    }

    // Marcador exacto: no se combina con winner_points ni goal_points.
    if (prediction.goals_team1 === realG1 && prediction.goals_team2 === realG2) {
      return { points: this.phase.result_points, matchType: 'exact' };
    }

    let points = 0;
    let matchType: 'winner' | 'goal' | 'none' = 'none';

    if (Math.sign(prediction.goals_team1 - prediction.goals_team2) === Math.sign(realG1 - realG2)) {
      points += this.phase.winner_points;
      matchType = 'winner';
    }

    // Goal_points: independiente de acertar el ganador. Se suma por cada
    // equipo cuya cantidad de goles predicha coincide con la real (0 o 1,
    // nunca los 2, porque eso ya sería marcador exacto).
    let goalHits = 0;
    if (prediction.goals_team1 === realG1) goalHits++;
    if (prediction.goals_team2 === realG2) goalHits++;
    if (goalHits > 0) {
      points += goalHits * (this.phase.goal_points ?? 0);
      if (matchType === 'none') matchType = 'goal';
    }

    return { points, matchType };
  }

  onScoreChange(row: GameRow) {
    row.edited = true;
    const shouldCalculate = row.game.end_game || row.edited;

    row.playerPredictions = this.players.map(player => {
      const prediction = this.predictionsGame.find(
        p => p.idPlayer === player.id && p.idGame === row.game.id
      );
      const { points, matchType } = this.calculatePoints(
        row.editableGoals1,
        row.editableGoals2,
        prediction,
        shouldCalculate
      );
      return { player, prediction, points, matchType };
    });

    this.recalculateAllScores();
    this.scoreChange$.next();
  }

  private recalculateAllScores() {
    this.players.forEach(p => this.playerScores.set(p.id, 0));

    this.gameRows.forEach(row => {
      if (!row.edited && !row.game.end_game) return;
      row.playerPredictions.forEach(pp => {
        const current = this.playerScores.get(pp.player.id) ?? 0;
        this.playerScores.set(pp.player.id, current + pp.points);
      });
    });
  }

  private persistScores() {
    // Solo persistir puntos de partidos editados (no finalizados),
    // porque los finalizados ya están incluidos en total_score de ndata.json
    const editedScores = new Map<number, number>();
    this.players.forEach(p => editedScores.set(p.id, 0));
    this.gameRows.forEach(row => {
      if (!row.edited || row.game.end_game) return;
      row.playerPredictions.forEach(pp => {
        const current = editedScores.get(pp.player.id) ?? 0;
        editedScores.set(pp.player.id, current + pp.points);
      });
    });
    this.dataService.setGamePoints(this.phase?.id ?? 1, editedScores);
  }

  getPlayerScore(playerId: number): number {
    return this.playerScores.get(playerId) ?? 0;
  }

  getPhaseScore(playerId: number): number {
    return this.phaseScores.get(playerId) ?? 0;
  }

private saveEditsToStorage() {
  if (!this.phase || typeof sessionStorage === 'undefined') return;
  const edits = this.gameRows
    .filter(r => r.edited)
    .map(r => ({ id: r.game.id, g1: r.editableGoals1, g2: r.editableGoals2 }));
  sessionStorage.setItem(`game_edits_phase_${this.phase.id}`, JSON.stringify(edits));
}

private restoreEditsFromStorage() {
  if (!this.phase || typeof sessionStorage === 'undefined') return;
  const raw = sessionStorage.getItem(`game_edits_phase_${this.phase.id}`);
  if (!raw) return;
  const edits: { id: number, g1: number, g2: number }[] = JSON.parse(raw);
  edits.forEach(edit => {
    const row = this.gameRows.find(r => r.game.id === edit.id);
    if (!row) return;
    row.editableGoals1 = edit.g1;
    row.editableGoals2 = edit.g2;
    row.edited = true;
    row.playerPredictions = this.players.map(player => {
      const prediction = this.predictionsGame.find(
        p => p.idPlayer === player.id && p.idGame === row.game.id
      );
      const { points, matchType } = this.calculatePoints(row.editableGoals1, row.editableGoals2, prediction, true);
      return { player, prediction, points, matchType };
    });
  });
  this.recalculateAllScores();
  this.persistScores();
}

get visiblePlayers(): Player[] {
  const id = this.dataService.selectedPlayerId();
  return id === 0 ? this.players : this.players.filter(p => p.id === id);
}

visiblePredictions(predictions: any[]): any[] {
  const id = this.dataService.selectedPlayerId();
  return id === 0 ? predictions : predictions.filter(pp => pp.player.id === id);
}

}