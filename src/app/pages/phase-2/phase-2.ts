import { Component } from '@angular/core';
import { PredictionGame, PredictionTeamPlayer, Team, TeamPhase } from '../../shared/models/team.model';
import { Phase } from '../../shared/models/phase.model';
import { Game, GamePhase } from '../../shared/models/game.model';
import { Player } from '../../shared/models/player.model';
import { ResultsTable } from '../../components/results-table/results-table';

@Component({
  selector: 'app-phase-2',
  imports: [ResultsTable],
  templateUrl: './phase-2.html',
  styleUrl: './phase-2.css',
})
export class Phase2  {


  phases: Phase[] = [
  new Phase(1, 8, 32, 8, 2),
  new Phase(2, 8, 16, 20, 5),
  new Phase(3, 8, 4, 2, 0),
  new Phase(4, 15, 7, 5, 3)
];

  team: Team[] = [
    new Team(1, 'Colombia', 'A'),
    new Team(2, 'Argentina', 'A'),
    new Team(3, 'Brasil', 'A'),
    new Team(4, 'Uruguay', 'A'),
    new Team(5, 'Bolivia', 'B'),
    new Team(6, 'Ecuador', 'B'),
    new Team(7, 'Paraguay', 'B'),
    new Team(8, 'Paises Bajos', 'B'),
    new Team(9, 'Inglaterra', 'B'),
    new Team(10, 'Italia', 'C'),
    new Team(11, 'Alemania', 'C'),
    new Team(12, 'España', 'C'),
    new Team(13, 'Francia', 'C'),
];

  games: Game[] = [
  //  new Game(1, this.team[0], this.team[9], 2, 1,this.team[0]),
  //  new Game(2, this.team[10], this.team[1], 3, 2,this.team[2]),
  //  new Game(3, this.team[2], this.team[3], 1, 1,this.team[3]),
  //  new Game(4, this.team[4], this.team[7], 4, 0,this.team[5]),
  //  new Game(5, this.team[8], this.team[9], 2, 2,this.team[7]),
  //  new Game(6, this.team[11], this.team[12], 1, 0,this.team[5]),

    new Game(1, this.team[0], this.team[12], 2, 1,this.team[0]),
    new Game(2, this.team[1], this.team[11], 3, 2,this.team[1]),
    new Game(3, this.team[2], this.team[10], 1, 1,this.team[2]),
    new Game(4, this.team[3], this.team[9], 4, 0,this.team[9]),
    new Game(5, this.team[4], this.team[8], 2, 2,this.team[8]),
    new Game(6, this.team[5], this.team[7], 1, 0,this.team[7]),
    new Game(7, this.team[3], this.team[4], 3, 0),
    new Game(8, this.team[0], this.team[11], 2, 2),
    new Game(9, this.team[8], this.team[12], 1, 4),
    new Game(10, this.team[4], this.team[1], 3, 1)
  ];
  

gamePhases: GamePhase[] = [
  new GamePhase(this.games[0], this.phases[0]),
  new GamePhase(this.games[1], this.phases[1]),
  new GamePhase(this.games[2], this.phases[2]),
  new GamePhase(this.games[3], this.phases[3])
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

 predictions: PredictionGame[] = [];

 phase: Phase | undefined;

   teamPhase: TeamPhase[] = [
     new TeamPhase(this.phases[1],this.team[0],0),
     new TeamPhase(this.phases[1],this.team[1],0),
     new TeamPhase(this.phases[1],this.team[2],0),
     new TeamPhase(this.phases[1],this.team[3],0),
     new TeamPhase(this.phases[1],this.team[4],0),
     new TeamPhase(this.phases[1],this.team[5],0),
     new TeamPhase(this.phases[1],this.team[6],0),
     new TeamPhase(this.phases[1],this.team[7],0),
   ];



  // Llamamos al método cuando se inicializa el componente
  ngOnInit(): void {
    this.phase = this.phases[1];
  
    this.games[6].end_game = true;
    this.games[8].end_game = true;
  
    this. predictions = [
      new PredictionGame(this.players[0], this.games[0], 2, 1, 0,0, this.team[0]),
      new PredictionGame(this.players[1], this.games[0], 1, 1, 0,0, this.team[0]),
      new PredictionGame(this.players[2], this.games[0], 3, 2, 0,0, this.team[12]),
      new PredictionGame(this.players[3], this.games[0], 2, 0, 0,0, this.team[12]),
      new PredictionGame(this.players[4], this.games[0], 1, 1, 0,0, this.team[0]),
      new PredictionGame(this.players[0], this.games[1], 2, 0, 0,0, this.team[1]),
      new PredictionGame(this.players[1], this.games[1], 4, 1, 0,0, this.team[1]),
      new PredictionGame(this.players[2], this.games[1], 3, 0, 0,0, this.team[1]),
      new PredictionGame(this.players[3], this.games[1], 2, 2, 0,0, this.team[1]),
      new PredictionGame(this.players[0], this.games[2], 1, 0, 0,0, this.team[2]),
      new PredictionGame(this.players[1], this.games[2], 1, 0, 0,0, this.team[2]),
      new PredictionGame(this.players[2], this.games[2], 1, 0, 0,0, this.team[2]),
      new PredictionGame(this.players[3], this.games[2], 1, 0, 0,0, this.team[10]),
   //   new PredictionGame(this.players[9], this.games[4], 1, 0, 0,),
   //   new PredictionGame(this.players[8], this.games[2], 1, 0, 0,),
   //   new PredictionGame(this.players[9], this.games[3], 1, 0, 0,),
   //   new PredictionGame(this.players[10], this.games[6], 1, 0),
   //   new PredictionGame(this.players[10], this.games[7], 1, 0),
   //   new PredictionGame(this.players[10], this.games[8], 1, 0),
   //   new PredictionGame(this.players[10], this.games[9], 1, 0),
   //   new PredictionGame(this.players[10], this.games[2], 1, 0),
   //   new PredictionGame(this.players[5], this.games[8], 1, 0, 0),
   //   new PredictionGame(this.players[1], this.games[4], 1, 0, 0),
   //   new PredictionGame(this.players[1], this.games[5], 1, 0, 0),
   //   new PredictionGame(this.players[1], this.games[6], 1, 0, 0),
   //   new PredictionGame(this.players[2], this.games[2], 1, 0, 0),
   //   new PredictionGame(this.players[2], this.games[5], 1, 0, 0),
   //   new PredictionGame(this.players[2], this.games[6], 2, 1, 0),
   //   new PredictionGame(this.players[3], this.games[5], 2, 1, 0),
   //   new PredictionGame(this.players[3], this.games[6], 2, 1, 0),
   //   new PredictionGame(this.players[3], this.games[7], 2, 1, 0),
   //   new PredictionGame(this.players[4], this.games[9], 2, 1, 0),
   //   new PredictionGame(this.players[4], this.games[1], 2, 1, 0),
   //   new PredictionGame(this.players[4], this.games[0], 1, 1, 0),
   //   new PredictionGame(this.players[5], this.games[9], 2, 0, 0),
   //   new PredictionGame(this.players[6], this.games[1], 2, 0, 0),
   //   new PredictionGame(this.players[7], this.games[8], 2, 0, 0),
   //   new PredictionGame(this.players[8], this.games[2], 2, 0, 0),
   //   new PredictionGame(this.players[7], this.games[0], 2, 0, 0),
    ];
  }
  

    predictionTeamPlayer: PredictionTeamPlayer[] = [
      new PredictionTeamPlayer(this.players[0],this.phases[1],this.team[0],1,0,false),
      new PredictionTeamPlayer(this.players[0],this.phases[1],this.team[2],1,0,false),
      new PredictionTeamPlayer(this.players[0],this.phases[1],this.team[4],1,0,false),
      new PredictionTeamPlayer(this.players[0],this.phases[1],this.team[5],1,0,false),
      new PredictionTeamPlayer(this.players[1],this.phases[1],this.team[1],1,0,false),
      new PredictionTeamPlayer(this.players[1],this.phases[1],this.team[3],1,0,false),
      new PredictionTeamPlayer(this.players[1],this.phases[1],this.team[4],1,0,false),
      new PredictionTeamPlayer(this.players[1],this.phases[1],this.team[5],1,0,false),
      new PredictionTeamPlayer(this.players[2],this.phases[1],this.team[0],1,0,false),
      new PredictionTeamPlayer(this.players[2],this.phases[1],this.team[3],1,0,false),
      new PredictionTeamPlayer(this.players[2],this.phases[1],this.team[5],1,0,false),
      new PredictionTeamPlayer(this.players[2],this.phases[1],this.team[6],1,0,false),

  
    ];

}
