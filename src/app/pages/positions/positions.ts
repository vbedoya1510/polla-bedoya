import { Component } from '@angular/core';
import { GroupsTable } from '../../components/groups-table/groups-table';
import { PredictionTeamPlayer, Team, TeamPhase } from '../../shared/models/team.model';
import { Player } from '../../shared/models/player.model';
import { Phase } from '../../shared/models/phase.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-positions',
  imports: [GroupsTable, CommonModule, FormsModule],
  templateUrl: './positions.html',
  styleUrl: './positions.css',
})
export class Positions {

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
    new Phase(1, 8, 32, 8, 2),
    new Phase(2, 8, 16, 20, 5),
    new Phase(3, 8, 4, 2, 0),
    new Phase(4, 15, 7, 5, 3)
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
      'Clasificar al torneo regional'
    ),
    new Player(
      2,
      'Ana Gómez',
      '3017654321',
      'ana.gomez@mail.com',
      false,
      2,
      'Llegar a la final del campeonato'
    ),
    new Player(
      3,
      'Luis Rodríguez',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      7,
      'Mejorar el rendimiento del equipo'
    ),
     new Player(
      4,
      'Victor Bedoya',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      7,
      'Mejorar el rendimiento del equipo'
    )
    ,
     new Player(
      5,
      'Sandra Gomez',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      7,
      'Mejorar el rendimiento del equipo'
    ),
     new Player(
      6,
      'Cristian Piedrahita',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      4,
      'Mejorar el rendimiento del equipo'
    )
    ,
     new Player(
      7,
      'Santiago Raigosa',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      5,
      'Mejorar el rendimiento del equipo'
    )
    ,
     new Player(
      8,
      'Jorge Gomez',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      7,
      'Mejorar el rendimiento del equipo'
    ) ,
     new Player(
      9,
      'Doña Olga',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      8,
      'Mejorar el rendimiento del equipo'
    ),
     new Player(
      10,
      'Tavo Bedoya',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      2,
      'Mejorar el rendimiento del equipo'
    ),
     new Player(
      11,
      'Nina',
      '3029876543',
      'luis.rodriguez@mail.com',
      true,
      5,
      'Mejorar el rendimiento del equipo'
    )
  ];
  
  predictionTeamPlayer: PredictionTeamPlayer[] = [
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[0],1),
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[1],2),
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[2],3),
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[3],4),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[0],2),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[1],1),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[2],4),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[3],3),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[0],1),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[1],4),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[2],3),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[3],2),

    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[4],1),
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[5],2),
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[6],3),
    new PredictionTeamPlayer(this.players[0],this.phases[0],this.team[7],4),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[4],2),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[5],1),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[6],4),
    new PredictionTeamPlayer(this.players[1],this.phases[0],this.team[7],3),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[4],1),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[5],4),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[6],3),
    new PredictionTeamPlayer(this.players[2],this.phases[0],this.team[7],2),

  ];

    ngOnInit(): void {
      this.phase = this.phases[0];  
      
      this.groups = [...new Set(this.team.map(t => t.group))];    

      
    }
}
