import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../shared/models/game.model';
import { Player } from '../../shared/models/player.model';
import { NPredictionGame, NPredictionTeam, Team } from '../../shared/models/team.model';
import { Phase } from '../../shared/models/phase.model';
import { NDataService } from '../../services/ndata.service';
import { NresultsTable } from '../../components/nresults-table/nresults-table';
import { NgroupsTable } from '../../components/ngroups-table/ngroups-table';

@Component({
  selector: 'app-phase-1',
  standalone: true,
  imports: [CommonModule,NresultsTable, NgroupsTable],
  templateUrl: './nphase-1.html',
  styleUrls: ['./nphase-1.css'],
})
export class NPhase1 {
  private dataService = inject(NDataService);
   private cdr = inject(ChangeDetectorRef);

  phaseNumber = 1;

  teams: Team[] = [];
  phases: Phase[] = [];
  phase?: Phase;
  players: Player[] = [];
  games: Game[] = [];
  predictionsGame: NPredictionGame[] = [];
  predictionTeam: NPredictionTeam[] = [];

 constructor() {
    effect(() => {
      const data = this.dataService.worldCupData();
      if (!data) return;

      this.teams = data.teams.map((t: any) => new Team(t.id, t.name, t.group));

      this.phases = data.phases.map((p: any) =>
        new Phase(p.id, p.classified_points, p.finalist_points, p.result_points, p.winner_points, p.winner_scorer)
      );

      this.phase = this.phases[this.phaseNumber - 1];

      this.players = data.players.map((p: any) =>
        new Player(p.id, p.name, p.phone, p.email, p.pay, p.total_score, p.position)
      );

      this.games = data.games
        .filter((g: any) => g.phase === this.phaseNumber)
        .map((g: any) =>
          new Game(
            g.id,
            this.teams.find((t: Team) => t.id === g.team1)!,
            this.teams.find((t: Team) => t.id === g.team2)!,
            g.goals_team1,
            g.goals_team2,
            g.end_game,
            g.phase,
            g.team_qualified
          )
        );
      this.dataService.initBaseScores();
      this.loadPredictions();
      this.cdr.detectChanges();
    });
  }

 private loadPredictions() {
    this.dataService.getPrediction(this.phaseNumber).subscribe({
      next: (predictions) => {
        const mappedGames: NPredictionGame[] = [];
        const mappedTeams: NPredictionTeam[] = [];

        const players: any[] = predictions.players ?? [];

        players.forEach((playerPrediction: any) => {
          const idPlayer = playerPrediction.id;

          playerPrediction.games.forEach((g: any) => {
            mappedGames.push(
              new NPredictionGame(idPlayer, g.game, g.goals_team1, g.goals_team2)
            );
          });

          playerPrediction.teamsGroupOrder.forEach((t: any) => {
            mappedTeams.push(
              new NPredictionTeam(idPlayer, this.phaseNumber, t.team, t.position)
            );
          });
        });

      this.predictionTeam = mappedTeams;
      this.predictionsGame = mappedGames;
      setTimeout(() => this.cdr.detectChanges());
      },
      error: (err) => console.error('Error cargando predicciones', err),
    });
  }

getPlayerScore(playerId: number): number {
  return this.dataService.playerTotalScores().get(playerId) ?? 0;
}
}