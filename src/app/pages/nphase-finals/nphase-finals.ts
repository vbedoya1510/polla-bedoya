import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../shared/models/game.model';
import { Player } from '../../shared/models/player.model';
import { NPredictionGame, Team } from '../../shared/models/team.model';
import { Phase } from '../../shared/models/phase.model';
import { NDataService } from '../../services/ndata.service';
import { NresultsTable } from '../../components/nresults-table/nresults-table';
import { NqualifiedTable } from '../../components/nqualified-table/nqualified-table';

@Component({
  selector: 'app-nphase-finals',
  standalone: true,
  imports: [CommonModule, NresultsTable, NqualifiedTable],
  templateUrl: './nphase-finals.html',
  styleUrl: './nphase-finals.css',
})
export class NphaseFinals {
  private dataService = inject(NDataService);
  private cdr = inject(ChangeDetectorRef);
  readonly phaseUnlocked = this.dataService.phaseUnlocked;

  teams: Team[] = [];
  players: Player[] = [];
  phases: Phase[] = [];

  phase4?: Phase;
  phase5?: Phase;
  phase6?: Phase;

  gamesPhase4: Game[] = [];
  gamesPhase5: Game[] = [];
  gamesPhase6: Game[] = [];

  predictionsPhase4: NPredictionGame[] = [];
  predictionsPhase5: NPredictionGame[] = [];
  predictionsPhase6: NPredictionGame[] = [];

  constructor() {
    effect(() => {
      const data = this.dataService.worldCupData();
      if (!data) return;

      this.teams = data.teams.map((t: any) => new Team(t.id, t.name, t.group));
      this.phases = data.phases.map((p: any) =>
        new Phase(p.id, p.classified_points, p.finalist_points, p.result_points, p.winner_points, p.winner_scorer)
      );

      this.phase4 = this.phases[3];
      this.phase5 = this.phases[4];
      this.phase6 = this.phases[5];

      this.players = data.players.map((p: any) =>
        new Player(p.id, p.name, p.phone, p.email, p.pay, p.total_score, p.position)
      );

      [4, 5, 6].forEach(phaseNum => {
        const games = data.games
          .filter((g: any) => g.phase === phaseNum && g.team1 !== 0 && g.team2 !== 0)
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
        if (phaseNum === 4) this.gamesPhase4 = games;
        if (phaseNum === 5) this.gamesPhase5 = games;
        if (phaseNum === 6) this.gamesPhase6 = games;
      });

      this.dataService.initBaseScores();
      this.loadPredictions(4);
      this.loadPredictions(5);
      this.loadPredictions(6);
      this.cdr.detectChanges();
    });
  }

  private loadPredictions(phaseNum: number) {
    this.dataService.getPrediction(phaseNum).subscribe({
      next: (predictions) => {
        const mappedGames: NPredictionGame[] = [];
        const players: any[] = predictions.players ?? [];

        players.forEach((playerPrediction: any) => {
          const idPlayer = playerPrediction.id;
          playerPrediction.games.forEach((g: any) => {
            const prediction = new NPredictionGame(idPlayer, g.game, g.goals_team1, g.goals_team2);
            prediction.team_qualified = this.teams.find((t) => t.id === g.team_qualified);
            mappedGames.push(prediction);
          });
        });

        if (phaseNum === 4) this.predictionsPhase4 = mappedGames;
        if (phaseNum === 5) this.predictionsPhase5 = mappedGames;
        if (phaseNum === 6) this.predictionsPhase6 = mappedGames;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: (err) => console.error(`Error cargando predicciones fase ${phaseNum}`, err),
    });
  }

  getPlayerScore(playerId: number): number {
    return this.dataService.playerTotalScores().get(playerId) ?? 0;
  }
}