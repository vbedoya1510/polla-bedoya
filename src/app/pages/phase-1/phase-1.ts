import { Component, computed, effect, inject } from '@angular/core';
import { ResultsTable } from '../../components/results-table/results-table';
import { Game, GamePhase } from '../../shared/models/game.model';
import { Player } from '../../shared/models/player.model';
import { PredictionGame, PredictionTeamPlayer, Team, TeamPhase } from '../../shared/models/team.model';
import { Phase } from '../../shared/models/phase.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-phase-1',
  standalone: true,
  imports: [ResultsTable],
  templateUrl: './phase-1.html',
  styleUrls: ['./phase-1.css'],
})
export class Phase1 {
  private dataService = inject(DataService);

  // 1. Conexión al tanque principal (Servicio)
  data = this.dataService.worldCupData;

  // 2. Tuberías locales (Solo viven en este componente)
  teams = computed(() => this.data()?.teams.map((t: Team) => new Team(t.id, t.name, t.group)) ?? []);
  phases = computed(() =>
    this.data()?.phases.map((p: any) =>
      new Phase(
        p.id,
        p.classified_points,
        p.finalist_points,
        p.result_points,
        p.winner_points,
        p.winner_scorer
      )
    ) ?? []
  );
  phase = computed(() => {
    const lista = this.phases();
    return lista.length > 0 ? lista[0] : undefined;
  });

  // 3. Variables normales para lo que NO quieres global
  predictionTeamPlayer: PredictionTeamPlayer[] = [];
  predictions: PredictionGame[] = [];

  players = computed(() => {
    const currentTeams = this.teams();
    return this.data()?.players.map((p: any) =>
      new Player(p.id, p.name, p.phone, p.email, p.pay, p.total_score,
        currentTeams.find((t: { id: any; }) => t.id === p.team_scorer_id)!,
        p.position, p.scorer_scorer)
    ) ?? [];
  });

  games = computed(() => {
    const currentTeams = this.teams();
    return this.data()?.games.map((g: any) =>
      new Game(g.id, currentTeams.find((t: { id: any; }) => t.id === g.team1)!,
        currentTeams.find((t: { id: any; }) => t.id === g.team2)!,
        g.goals_team1, g.goals_team2)
    ) ?? [];
  });

  constructor() {
    // El effect es como un "vigilante". 
    // Cuando 'phases' deja de estar vacío, dispara la carga de predicciones.
    effect(() => {
      const listaPhases = this.phases();
      if (listaPhases.length > 0) {
        this.getPredictions(listaPhases[0].id);
      }
    });
  }

  getPredictions(idPhase: number) {
    this.dataService.getPrediction(idPhase).subscribe({
      next: prediction => {
        // IMPORTANTE: Obtenemos los valores actuales de los signals una sola vez
        const currentPlayers = this.players();
        const currentTeams = this.teams();
        const currentPhases = this.phases();
        const currentGames = this.games();

        this.predictionTeamPlayer = prediction.predictionTeam.map((p: any) =>
          new PredictionTeamPlayer(
            currentPlayers.find((pl: { id: any; }) => pl.id === p.player)!, // Uso de variable local
            currentPhases.find((ph: { id: any; }) => ph.id === p.phase)!,
            currentTeams.find((te: { id: any; }) => te.id === p.team)!,
            p.position, p.score, p.finals
          )
        );

        this.predictions = prediction.predictionGame.map((p: any) =>
          new PredictionGame(
            currentPlayers.find((pl: { id: any; }) => pl.id === p.player)!,
            currentGames.find((ga: { id: any; }) => ga.id === p.game)!,
            p.goals_team1, p.goals_team2, p.score, p.scoreTeam
          )
        );
      },
      error: err => console.error('Error:', err)
    });
  }
}
