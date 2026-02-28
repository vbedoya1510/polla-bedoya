import { Component, computed, effect, inject, Input, signal } from '@angular/core';
import { ResultsTable } from '../../components/results-table/results-table';
import { Game } from '../../shared/models/game.model';
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

  phaseNumber: number = 1;

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
    return lista.length > 0 ? lista[this.phaseNumber - 1] : undefined;
  });

  // 3. Variables normales para lo que NO quieres global
predictions = signal<PredictionGame[]>([]);
predictionTeamPlayer = signal<PredictionTeamPlayer[]>([]);
predictionTeamFinals = signal<PredictionTeamPlayer[]>([]);
viewQualified = signal<boolean>(false);

  players = computed(() => {
    const currentTeams = this.teams();
  console.log('Data cruda recibida:', this.data());
    return this.data()?.players.map((p: any) =>
      new Player(p.id, p.name, p.phone, p.email, p.pay, p.total_score,
        currentTeams.find((t: { id: any; }) => t.id === p.team_scorer_id)!,
        p.position, p.scorer_scorer)
    ) ?? [];
  });

  games = computed(() => {
    const currentTeams = this.teams();
    return this.data()?.games
      .filter((g: Game) => g.phase === this.phaseNumber)
      .map((g: Game) =>
      new Game(g.id, currentTeams.find((t: { id: any; }) => t.id === g.team1)!,
        currentTeams.find((t: { id: any; }) => t.id === g.team2)!,
        g.goals_team1, g.goals_team2, g.end_game, g.phase,g.team_qualified)
    ) ?? [];
  });

 

  
  teamsPositionsFinals = computed(() => {
    const currentTeams = this.teams();
    const listaPhases = this.phases();
    return this.data()?.teamsPositions.map((tp: any) =>
      new TeamPhase(        
        listaPhases[this.phaseNumber - 1].id,
        currentTeams.find((t: { id: any; }) => t.id === tp.idTeam)!,
        tp.id ?? 0 
      )
    ) ?? [];
  });


  constructor() {
    // El effect es como un "vigilante". 
    // Cuando 'phases' deja de estar vacío, dispara la carga de predicciones.
    effect(() => {
      const listaPhases = this.phases();
      if (listaPhases.length > 0) {
        this.viewQualified.set(this.phaseNumber === 2 || this.phaseNumber === 3);
        this.getPredictions(listaPhases[this.phaseNumber - 1].id);
      }
    });
  }

getPredictions(idPhase: number) {
  const key = `predictions_${idPhase}`;
  const savedData = sessionStorage.getItem(key);

  // 1. INTENTO CARGAR DE CACHÉ
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      console.log('--- [DEBUG PADRE] Recuperando del Storage ---', parsed);

      // Si el objeto tiene la estructura de "paquete" (games, teams, finals)
      if (parsed.games || parsed.teams || parsed.finals) {
        this.predictions.set(parsed.games || []);
        this.predictionTeamPlayer.set(parsed.teams || []);
        this.predictionTeamFinals.set(parsed.finals || []);
      } else {
        // Fallback por si el JSON guardado es un array plano (versiones viejas)
        this.predictions.set(parsed);
        this.predictionTeamPlayer.set(parsed);
        this.predictionTeamFinals.set(parsed);
      }
      return; 
    } catch (e) {
      console.error("Error parseando storage", e);
    }
  }

  // 2. SI NO HAY CACHÉ, VOY AL SERVIDOR
  this.dataService.getPrediction(idPhase).subscribe({
    next: prediction => {
      const currentPlayers = this.players();
      const currentTeams = this.teams();
      const currentPhases = this.phases();
      const currentGames = this.games();

      // Mapeos (Exactamente como los tenías)
      const mappedTeams = prediction?.predictionTeam?.map((p: any) =>
        new PredictionTeamPlayer(
          currentPlayers.find((pl: any) => pl.id === p.player)!,
          currentPhases.find((ph: any) => ph.id === p.phase)!,
          currentTeams.find((te: any) => te.id === p.team)!,
          p.position, p.score, p.finals
        )
      ) || [];

      const mappedTeamsFinals = prediction?.predictionTeamFinals?.map((p: any) =>
        new PredictionTeamPlayer(
          currentPlayers.find((pl: any) => pl.id === p.player)!,
          currentPhases.find((ph: any) => ph.id === p.phase)!,
          currentTeams.find((te: any) => te.id === p.team)!,
          p.position, p.score, p.finals
        )
      ) || [];

      const mappedPredictions = prediction.predictionGame.map((p: any) =>
        new PredictionGame(
          currentPlayers.find((pl: any) => pl.id === p.player)!,
          currentGames.find((ga: any) => ga.id === p.game)!,
          p.goals_team1, p.goals_team2, p.score, p.scoreTeam, p.team_qualified
        )
      ) || [];

      // 3. GUARDAR CON ESTRUCTURA UNIFICADA
      const dataToSave = {
        games: mappedPredictions,
        teams: mappedTeams,
        finals: mappedTeamsFinals
      };
      sessionStorage.setItem(key, JSON.stringify(dataToSave));

      // 4. ACTUALIZAR VISTA
      this.predictions.set(mappedPredictions);
      this.predictionTeamPlayer.set(mappedTeams);
      this.predictionTeamFinals.set(mappedTeamsFinals);
    },
    error: err => console.error('Error:', err)
  });
 
}
}
