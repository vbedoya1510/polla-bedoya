import { Component, effect, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { NDataService } from '../../services/ndata.service';
import { Team, NPredictionTeam } from '../../shared/models/team.model';
import { Player } from '../../shared/models/player.model';
import { Phase } from '../../shared/models/phase.model';
import { NfinalsTable } from '../../components/nfinals-table/nfinals-table';

@Component({
  selector: 'app-nfinals',
  standalone: true,
  imports: [FormsModule, NfinalsTable],
  templateUrl: './nfinals.html',
  styleUrls: ['./nfinals.css'],
})
export class NFinals {
  public dataService = inject(NDataService);
  readonly phaseUnlocked = this.dataService.phaseUnlocked;
  private cdr = inject(ChangeDetectorRef);

  scorerPredictionsPhase1: { [playerId: number]: number } = {};

  teams: Team[] = [];
  players: Player[] = [];
  phases: Phase[] = [];
  positions = [1, 2, 3, 4];
  selectedScorer: number[] = [];
  hasRealScorer = false;
  hasRealPositions: { [pos: number]: boolean } = { 1: false, 2: false, 3: false, 4: false };

  selectedTeams: { [position: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0 };

  predictionTeamsPhase1: NPredictionTeam[] = [];
  predictionTeamsPhase2: NPredictionTeam[] = [];
  predictionTeamsPhase3: NPredictionTeam[] = [];

  constructor() {
    // Los estados bloqueados vienen siempre del ndata.json original (no del cache sessionStorage)
    this.dataService.getData().subscribe({
      next: (data) => {
        data.teamsPositions.forEach((tp: any) => {
          this.hasRealPositions[tp.id] = tp.idTeam !== 0;
        });
        this.selectedScorer = (data.teamScorer?.idTeams ?? []).map(Number);
        this.hasRealScorer = this.selectedScorer.length > 0;
        this.cdr.detectChanges();
      }
    });

    effect(() => {
      const data = this.dataService.worldCupData();
      if (!data) return;

      this.teams = data.teams
        .map((t: any) => new Team(t.id, t.name, t.group))
        .sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name));

      this.players = data.players.map((p: any) =>
        new Player(p.id, p.name, p.phone, p.email, p.pay, p.total_score, p.position)
      );
      this.phases = data.phases.map((p: any) =>
        new Phase(p.id, p.classified_points, p.finalist_points, p.result_points, p.winner_points, p.winner_scorer, p.goal_points)
      );

      data.teamsPositions.forEach((tp: any) => {
        if (tp.idTeam) this.selectedTeams[tp.id] = tp.idTeam;
      });

      this.loadPredictions();
      this.cdr.detectChanges();
    });
  }

  private loadPredictions() {
    forkJoin({
      phase1: this.dataService.getPrediction(1),
      phase2: this.dataService.getPrediction(2),
      phase3: this.dataService.getPrediction(3),
    }).subscribe({
      next: ({ phase1, phase2, phase3 }) => {
        this.predictionTeamsPhase1 = this.mapPredictions(phase1, 1);
        this.predictionTeamsPhase2 = this.mapPredictions(phase2, 2);
        this.predictionTeamsPhase3 = this.mapPredictions(phase3, 3);
        this.scorerPredictionsPhase1 = { ...this.mapScorers(phase1) };
        setTimeout(() => this.cdr.detectChanges());
      },
      error: (err) => console.error('Error cargando predicciones', err),
    });
  }

private mapPredictions(data: any, phase: number): NPredictionTeam[] {
  const result: NPredictionTeam[] = [];
  (data.players ?? []).forEach((p: any) => {
    (p.teamsFinalsOrder ?? []).forEach((t: any) => {
      result.push(new NPredictionTeam(p.id, phase, t.team, t.position));
    });
  });
  return result;
}

  availableTeamsFor(position: number): Team[] {
    const others = Object.entries(this.selectedTeams)
      .filter(([pos]) => +pos !== position)
      .map(([, id]) => id)
      .filter(id => id !== 0);
    return this.teams.filter(t => !others.includes(t.id));
  }

onSelectionChange() {
  const teamsPositions = this.positions.map(pos => ({
    id: pos,
    idTeam: +(this.selectedTeams[pos] || 0),
  }));
  const currentScorer = this.dataService.worldCupData()?.teamScorer;
  this.dataService.updateFinals(teamsPositions, {
    idTeams: this.selectedScorer.map(Number),
    scorer_points: currentScorer?.scorer_points ?? 40,
  });
}

private mapScorers(data: any): { [playerId: number]: number } {
  const obj: { [playerId: number]: number } = {};
  (data.players ?? []).forEach((p: any) => {
    if (p.teamScorer) obj[p.id] = p.teamScorer;
  });
  return obj;
}
}