import { Component } from '@angular/core';
import { ResultsTable } from '../../components/results-table/results-table';
import { Game, GamePhase } from '../../shared/models/game.model';
import { Player } from '../../shared/models/player.model';
import { PredictionGame } from '../../shared/models/winner.model';
import { Phase } from '../../shared/models/phase.model';

@Component({
  selector: 'app-phase-1',
  standalone: true,
  imports: [ResultsTable],
  templateUrl: './phase-1.html',
  styleUrls: ['./phase-1.css'] ,
})
export class Phase1 {


  phases: Phase[] = [
  new Phase(1, 8, 32, 8, 2),
  new Phase(2, 8, 16, 20, 5),
  new Phase(3, 8, 4, 2, 0),
  new Phase(4, 15, 7, 5, 3)
];

  games: Game[] = [
    new Game(1, 'Barcelona', 'Real Madrid', 2, 1),
    new Game(2, 'Liverpool', 'Chelsea', 3, 2),
    new Game(3, 'Bayern Munich', 'Borussia Dortmund', 1, 1),
    new Game(4, 'PSG', 'Marseille', 4, 0),
    new Game(5, 'Juventus', 'Inter Milan', 2, 2),
    new Game(6, 'Manchester United', 'Arsenal', 1, 0),
    new Game(7, 'AC Milan', 'Napoli', 3, 0),
    new Game(8, 'Atletico Madrid', 'Sevilla', 2, 2),
    new Game(9, 'Tottenham', 'Manchester City', 1, 4),
    new Game(10, 'River Plate', 'Boca Juniors', 3, 1)
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



  // Llamamos al método cuando se inicializa el componente
  ngOnInit(): void {
    this.phase = this.phases[0];
	
	this.games[6].end_game = true;
    this.games[8].end_game = true;
	
    this. predictions = [
      new PredictionGame(this.players[0], this.games[0], 2, 1),
      new PredictionGame(this.players[1], this.games[0], 1, 1),
      new PredictionGame(this.players[2], this.games[1], 3, 2),
      new PredictionGame(this.players[3], this.games[1], 2, 0),
      new PredictionGame(this.players[4], this.games[2], 1, 1),
      new PredictionGame(this.players[0], this.games[2], 2, 0),
      new PredictionGame(this.players[1], this.games[3], 4, 1),
      new PredictionGame(this.players[2], this.games[3], 3, 0),
      new PredictionGame(this.players[3], this.games[4], 2, 2),
      new PredictionGame(this.players[5], this.games[1], 1, 0),
      new PredictionGame(this.players[4], this.games[7], 1, 0),
      new PredictionGame(this.players[6], this.games[4], 1, 0),
      new PredictionGame(this.players[7], this.games[3], 1, 0),
      new PredictionGame(this.players[9], this.games[4], 1, 0),
      new PredictionGame(this.players[8], this.games[2], 1, 0),
      new PredictionGame(this.players[9], this.games[3], 1, 0),
      new PredictionGame(this.players[10], this.games[6], 1, 0),
      new PredictionGame(this.players[10], this.games[7], 1, 0),
      new PredictionGame(this.players[10], this.games[8], 1, 0),
      new PredictionGame(this.players[10], this.games[9], 1, 0),
      new PredictionGame(this.players[10], this.games[2], 1, 0),
      new PredictionGame(this.players[5], this.games[8], 1, 0),
      new PredictionGame(this.players[1], this.games[4], 1, 0),
      new PredictionGame(this.players[1], this.games[5], 1, 0),
      new PredictionGame(this.players[1], this.games[6], 1, 0),
      new PredictionGame(this.players[2], this.games[2], 1, 0),
      new PredictionGame(this.players[2], this.games[5], 1, 0),
      new PredictionGame(this.players[2], this.games[6], 2, 1),
      new PredictionGame(this.players[3], this.games[5], 2, 1),
      new PredictionGame(this.players[3], this.games[6], 2, 1),
      new PredictionGame(this.players[3], this.games[7], 2, 1),
      new PredictionGame(this.players[4], this.games[9], 2, 1),
      new PredictionGame(this.players[4], this.games[1], 2, 1),
      new PredictionGame(this.players[4], this.games[0], 1, 1),
      new PredictionGame(this.players[5], this.games[9], 2, 0),
      new PredictionGame(this.players[6], this.games[1], 2, 0),
      new PredictionGame(this.players[7], this.games[8], 2, 0),
      new PredictionGame(this.players[8], this.games[2], 2, 0),
      new PredictionGame(this.players[7], this.games[0], 2, 0),
    ];
  }

}
