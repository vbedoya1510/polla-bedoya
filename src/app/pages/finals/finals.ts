import { Component } from '@angular/core';
import { PredictionGame, PredictionTeamPlayer, Team, TeamPhase } from '../../shared/models/team.model';
import { Player } from '../../shared/models/player.model';
import { Phase } from '../../shared/models/phase.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FinalsTable } from '../../components/finals-table/finals-table';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-finals',
  imports: [FinalsTable, CommonModule, FormsModule],
  templateUrl: './finals.html',
  styleUrl: './finals.css',
})
export class Finals {

  constructor(private dataService: DataService) {}

  phases: Phase[] = [];

  teams: Team[] = [];



  predictionTeamPlayer: PredictionTeamPlayer[] = [];

  highThreshold: number = 0;
  lowThreshold: number = 0;

  editingPlayer: number | null = null;

  groups: string[] = [];
  playerFilter: string = '';
  gameFilter: string = '';
  scoreFilter: string = '';


   phase: Phase | undefined;
   
  players: Player[] = [];
  
   predictions: PredictionGame[] = [];
  
  


    ngOnInit(): void {
      this.dataService.getData().subscribe({
        next: data => {
          this.teams = data.teams.map((t: any) =>
            new Team(t.id, t.name, t.group)
          );
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
              p.position
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
          
          },
          error: err => {
            console.error('Error leyendo JSON:', err);
          }
        }); 
    }


  }
