import { Component, Input, OnChanges, inject, signal, effect, ChangeDetectorRef, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../shared/models/player.model';
import { NPredictionTeam, Team } from '../../shared/models/team.model';
import { Phase } from '../../shared/models/phase.model';
import { NDataService } from '../../services/ndata.service';

@Component({
  selector: 'app-nfinals-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nfinals-table.html',
  styleUrl: './nfinals-table.css',
})
export class NfinalsTable implements OnChanges {
  @Input() predictionTeams: NPredictionTeam[] = [];
  @Input() players: Player[] = [];
  @Input() phase!: Phase;
  @Input() teams: Team[] = [];
  @Input() scorerPredictions: { [playerId: number]: number } = {};
  // Posiciones/goleador que ya venían fijados en el ndata.json original: su puntaje
  // ya está incluido en total_score, así que no se deben volver a sumar aquí.
  @Input() hasRealPositions: { [pos: number]: boolean } = {};
  @Input() hasRealScorer = false;

  public dataService = inject(NDataService);
  private cdr = inject(ChangeDetectorRef);

  positions = [1, 2, 3, 4];
  phasePoints = new Map<number, number>();

  protected readonly Object = Object;

  constructor() {
    effect(() => {
      const positions = this.dataService.teamsPositions();
      untracked(() => {
        this.calculatePoints();
        this.cdr.detectChanges();
      });
    });
  }

  ngOnChanges() {
    console.log('scorerPredictions input:', this.scorerPredictions);
    this.calculatePoints();
  }

  getTeamName(teamId: number): string {
    return this.teams.find(t => t.id === teamId)?.name ?? '-';
  }

  getPrediction(playerId: number, position: number): number {
    return this.predictionTeams.find(
      pt => pt.idPlayer === playerId && pt.position === position
    )?.idTeam ?? 0;
  }

  isCorrect(playerId: number, position: number): boolean {
    const predicted = this.getPrediction(playerId, position);
    const actual = this.dataService.teamsPositions()
      .find((ap: any) => ap.id === position)?.idTeam ?? 0;
    return predicted !== 0 && actual !== 0 && predicted === actual;
  }

  getPhasePoints(playerId: number): number {
    return this.phasePoints.get(playerId) ?? 0;
  }

  private calculatePoints() {
    if (!this.phase || !this.players.length) return;
    const displayPoints = new Map<number, number>();
    const persistPoints = new Map<number, number>();
    const scorerPoints = this.dataService.worldCupData()?.teamScorer?.scorer_points ?? 40;

    this.players.forEach(player => {
      let displayTotal = 0;
      let persistTotal = 0;
      this.positions.forEach(pos => {
        if (this.isCorrect(player.id, pos)) {
          const pts = this.phase.finalist_points ?? 0;
          displayTotal += pts;
          // Si la posición ya venía fijada en el ndata.json original, su puntaje
          // ya está incluido en total_score: no sumarla de nuevo al total global.
          if (!this.hasRealPositions[pos]) persistTotal += pts;
        }
      });
      if (this.isScorerCorrect(player.id)) {
        displayTotal += scorerPoints;
        if (!this.hasRealScorer) persistTotal += scorerPoints;
      }
      displayPoints.set(player.id, displayTotal);
      persistPoints.set(player.id, persistTotal);
    });

    this.phasePoints = displayPoints;
    this.dataService.setFinalistPoints(this.phase.id, persistPoints);
  }

 isScorerCorrect(playerId: number): boolean {
  const predicted = +(this.scorerPredictions[playerId] ?? 0);
  const actuals: number[] = this.dataService.teamScorer()?.idTeams ?? [];
  return predicted !== 0 && actuals.length > 0 && actuals.map(Number).includes(predicted);
}

  get visiblePlayers(): Player[] {
    const id = this.dataService.selectedPlayerId();
    return id === 0 ? this.players : this.players.filter(p => p.id === id);
  }

}