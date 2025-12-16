import { Component } from '@angular/core';
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
  styleUrls: ['./phase-1.css'] ,
})
export class Phase1 {


  constructor(private dataService: DataService) {}


  phases: Phase[] = [];
  teams: Team[] = [];
  games: Game[] = [];  

  teamScorer: Team | undefined;

  gamePhases: GamePhase[] = [];


  players: Player[] = [];

 predictions: PredictionGame[] = [];

 phase: Phase | undefined;

predictionTeamPlayer: PredictionTeamPlayer[] = [
  ];

  // Llamamos al método cuando se inicializa el componente
  ngOnInit(): void {

    this.dataService.getData().subscribe({
      next: data => {
        this.teams = data.teams.map((t: any) =>
          new Team(t.id, t.name, t.group)
        );
        this.teamScorer = data.teamScorer;
        this.phases = data.phases.map((t: any) =>
          new Phase(t.id, t.classified_points, t.finalist_points, t.result_points, t.winner_points, t.winner_scorer)
        );
        this.players = data.players.map((p: any) =>
          new Player(
            p.id,
            p.name,
            p.phone,
            p.email,
            p.pay,
            p.total_score,
            this.teams.find(t => t.id === p.team_scorer_id)!, 
            p.position,
            p.scorer_scorer
          ));
        this.games = data.games.map((p: any) =>
          new Game(
            p.id,
            this.teams.find(t => t.id === p.team1)!,
            this.teams.find(t => t.id === p.team2)!,
            0,
            0
          ));

          this.phase = this.phases[0];
          this.getPredictions(this.phase.id);
      },
      error: err => {
        console.error('Error leyendo JSON:', err);
      }
    });
    
  }

  getPredictions(idPhase: number){

    
    console.log('JSON this.players : ', JSON.stringify(this.players, null, 2));

    this.dataService.getPrediction(idPhase).subscribe({
        next: prediction => {
          this.predictionTeamPlayer = prediction.predictionTeam.map((p: any) =>
            new PredictionTeamPlayer(
              this.players.find(t => t.id === p.player)!,
              this.phases.find(t => t.id === p.phase)!,
              this.teams.find(t => t.id === p.team)!,
              p.position, 
              p.score, 
              p.finals
            )
          );
          this.predictions =  prediction.predictionGame.map((p: any) =>
            new PredictionGame(
              this.players.find(t => t.id === p.player)!,
              this.games.find(t => t.id === p.game)!,
              p.goals_team1,
              p.goals_team2,
              p.score, 
              p.scoreTeam
            )
          );          
        },
        error: err => {
          console.error('Error leyendo JSON:', err);
        }
      }); 
  }

}
