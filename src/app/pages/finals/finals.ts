import { Component } from '@angular/core';
import { PredictionTeamPlayer, Team, TeamPhase } from '../../shared/models/team.model';
import { Player } from '../../shared/models/player.model';
import { Phase } from '../../shared/models/phase.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FinalsTable } from '../../components/finals-table/finals-table';

@Component({
  selector: 'app-finals',
  imports: [FinalsTable, CommonModule, FormsModule],
  templateUrl: './finals.html',
  styleUrl: './finals.css',
})
export class Finals {

  highThreshold: number = 0;
  lowThreshold: number = 0;

  editingPlayer: number | null = null;

  predictionsOrderByPlayer: PredictionTeamPlayer[] = [];
   originalGroup: TeamPhase[] = [];
  groups: string[] = [];
  playerFilter: string = '';
  gameFilter: string = '';
  scoreFilter: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 10;

   phase: Phase | undefined;
  
 
      team: Team[] = [
        new Team(1, 'Brasil', 'A'),
        new Team(2, 'Ghana', 'A'),
        new Team(3, 'Japon', 'A'),
        new Team(4, 'Mexico', 'A'),
        new Team(5, 'Argentina', 'B'),
        new Team(6, 'EEUU', 'B'),
        new Team(7, 'Noruega', 'B'),
        new Team(8, 'Arabia Saudi', 'B'),
      ];
  
    phases: Phase[] = [
    new Phase(1, 8, 32, 8, 2,1),
    new Phase(2, 8, 16, 20, 5,1),
    new Phase(3, 8, 4, 2, 0,1),
    new Phase(4, 15, 7, 5, 3,1)
  ];
  
  teamPhase: TeamPhase[] = [
    new TeamPhase(this.phases[0],this.team[0],0),
    new TeamPhase(this.phases[0],this.team[1],0),
    new TeamPhase(this.phases[0],this.team[2],0),
    new TeamPhase(this.phases[0],this.team[3],0),
    new TeamPhase(this.phases[0],this.team[4],0),
    new TeamPhase(this.phases[0],this.team[5],0),
    new TeamPhase(this.phases[0],this.team[6],0),
    new TeamPhase(this.phases[0],this.team[7],0),
  ];
  
  players: Player[] = [
    new Player(
      1,
      'Carlos Pérez',
      '3001234567',
      'carlos.perez@mail.com',
      false,
      8,
      this.team[7]
    ),
    new Player(
      2,
      'Ana Gómez',
      '3017654321',
      'ana.gomez@mail.com',
      false,
      2,
      this.team[7]
    ),
    new Player(
      3,
      'Luis Rodríguez',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      7,
      this.team[7]
    ),
     new Player(
      4,
      'Victor Bedoya',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      7,
      this.team[7]
    )
    ,
     new Player(
      5,
      'Sandra Gomez',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      7,
      this.team[7]
    ),
     new Player(
      6,
      'Cristian Piedrahita',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      4,
      this.team[7]
    )
    ,
     new Player(
      7,
      'Santiago Raigosa',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      5,
      this.team[7]
    )
    ,
     new Player(
      8,
      'Jorge Gomez',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      7,
      this.team[7]
    ) ,
     new Player(
      9,
      'Doña Olga',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      8,
      this.team[7]
    ),
     new Player(
      10,
      'Tavo Bedoya',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      2,
      this.team[7]
    ),
     new Player(
      11,
      'Nina',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      5,
      this.team[7]
    )
  ];
  
  predictionTeamPlayer: PredictionTeamPlayer[] = [
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[0],1,0,true),
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[1],2,0,true),
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[2],3,0,true),
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[3],4,0,true),
    new PredictionTeamPlayer(this.players[0],this.phases[1],this.team[4],2,0,true),
    new PredictionTeamPlayer(this.players[0],this.phases[1],this.team[5],1,0,true),
    new PredictionTeamPlayer(this.players[0],this.phases[1],this.team[3],4,0,true),
    new PredictionTeamPlayer(this.players[0],this.phases[1],this.team[2],3,0,true),

    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[4],1,0,true),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[5],2,0,true),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[2],3,0,true),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[3],4,0,true),
    new PredictionTeamPlayer(this.players[1],this.phases[1],this.team[4],2,0,true),
    new PredictionTeamPlayer(this.players[1],this.phases[1],this.team[5],1,0,true),
    new PredictionTeamPlayer(this.players[1],this.phases[1],this.team[3],4,0,true),
    new PredictionTeamPlayer(this.players[1],this.phases[1],this.team[2],3,0,true),

    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[1],1,0,true),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[6],2,0,true),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[7],3,0,true),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[2],4,0,true),
    new PredictionTeamPlayer(this.players[2],this.phases[1],this.team[5],2,0,true),
    new PredictionTeamPlayer(this.players[2],this.phases[1],this.team[4],1,0,true),
    new PredictionTeamPlayer(this.players[2],this.phases[1],this.team[3],4,0,true),
    new PredictionTeamPlayer(this.players[2],this.phases[1],this.team[2],3,0,true),

  ];

    ngOnInit(): void {
      this.phase = this.phases[0];  
      
      this.groups = [...new Set(this.team.map(t => t.group))];    

      this.team.sort((a, b) => a.name.localeCompare(b.name));

      
    }
  }
