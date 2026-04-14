import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { Game } from '../../shared/models/game.model';
import { Player } from '../../shared/models/player.model';
import { NPredictionGame } from '../../shared/models/team.model';
import { Phase } from '../../shared/models/phase.model';
import { NDataService } from '../../services/ndata.service';

interface QualifiedRow {
  game: Game;
  selectedTeamId: number;
  locked: boolean;
  playerPredictions: {
    player: Player;
    predictedTeamId: number;
    points: number;
    correct: boolean;
  }[];
}

@Component({
  selector: 'app-nqualified-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nqualified-table.html',
  styleUrl: './nqualified-table.css',
})
export class NqualifiedTable implements OnInit, OnChanges, OnDestroy {
  @Input() games: Game[] = [];
  @Input() players: Player[] = [];
  @Input() predictionsGame: NPredictionGame[] = [];
  @Input() phase?: Phase;

  qualifiedRows: QualifiedRow[] = [];
  playerScores: Map<number, number> = new Map();

  private scoreChange$ = new Subject<void>();

  constructor(private dataService: NDataService) { }

  ngOnInit() {
    this.scoreChange$
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.persistScores();
        this.saveToStorage();
      });
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

  ngOnDestroy() {
    this.saveToStorage();
    this.persistScores();
    this.scoreChange$.complete();
  }

  private buildTable() {
    this.qualifiedRows = this.games.map(game => {
      const locked = (game.team_qualified ?? 0) !== 0;
      const selectedTeamId = game.team_qualified ?? 0;
      return {
        game,
        selectedTeamId,
        locked,
        playerPredictions: this.players.map(player => {
          const pred = this.predictionsGame.find(
            p => p.idPlayer === player.id && p.idGame === game.id
          );
          const predictedTeamId = pred?.team_qualified?.id ?? 0;
          const correct = locked && predictedTeamId !== 0 && predictedTeamId === selectedTeamId;
          return {
            player,
            predictedTeamId,
            points: correct ? (this.phase?.classified_points ?? 0) : 0,
            correct
          };
        })
      };
    });

    this.recalculateAllScores();
    this.restoreFromStorage();
  }

  onQualifiedChange(row: QualifiedRow) {
    row.selectedTeamId = Number(row.selectedTeamId);

    row.playerPredictions = row.playerPredictions.map(pp => {
      const correct = row.selectedTeamId !== 0 && pp.predictedTeamId === row.selectedTeamId;
      return { ...pp, correct, points: correct ? (this.phase?.classified_points ?? 0) : 0 };
    });
    this.recalculateAllScores();
    this.scoreChange$.next();
  }

  private recalculateAllScores() {
    this.players.forEach(p => this.playerScores.set(p.id, 0));
    this.qualifiedRows.forEach(row => {
      row.playerPredictions.forEach(pp => {
        const current = this.playerScores.get(pp.player.id) ?? 0;
        this.playerScores.set(pp.player.id, current + pp.points);
      });
    });
  }

  private persistScores() {
    const nonLockedScores = new Map<number, number>();
    this.players.forEach(p => nonLockedScores.set(p.id, 0));
    this.qualifiedRows.forEach(row => {
      if (row.locked) return;
      row.playerPredictions.forEach(pp => {
        const current = nonLockedScores.get(pp.player.id) ?? 0;
        nonLockedScores.set(pp.player.id, current + pp.points);
      });
    });
    this.dataService.setQualifiedPoints(this.phase?.id ?? 2, nonLockedScores);
  }

  private saveToStorage() {
    if (!this.phase || typeof sessionStorage === 'undefined') return;
    const edits = this.qualifiedRows
      .filter(r => r.selectedTeamId !== 0 && !r.locked)
      .map(r => ({ gameId: r.game.id, teamId: r.selectedTeamId }));
    sessionStorage.setItem(`qualified_edits_phase_${this.phase.id}`, JSON.stringify(edits));
  }

  private restoreFromStorage() {
    if (!this.phase || typeof sessionStorage === 'undefined') return;
    const raw = sessionStorage.getItem(`qualified_edits_phase_${this.phase.id}`);
    if (!raw) return;
    const edits: { gameId: number, teamId: number }[] = JSON.parse(raw);
    edits.forEach(edit => {
      const row = this.qualifiedRows.find(r => r.game.id === edit.gameId);
      if (!row || row.locked) return;
      row.selectedTeamId = edit.teamId;
      row.playerPredictions = row.playerPredictions.map(pp => {
        const correct = pp.predictedTeamId === edit.teamId;
        return { ...pp, correct, points: correct ? (this.phase?.classified_points ?? 0) : 0 };
      });
    });
    this.recalculateAllScores();
    this.persistScores();
  }

  getPlayerScore(playerId: number): number {
    return this.playerScores.get(playerId) ?? 0;
  }

  getTeamName(teamId: number, game: Game): string {
    if (game.team1.id === teamId) return game.team1.name;
    if (game.team2.id === teamId) return game.team2.name;
    return '-';
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