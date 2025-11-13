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
  new Phase(1, 10, 5, 3, 1),
  new Phase(2, 12, 6, 4, 2),
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
    new Game(7, 'AC Milan', 'Napoli', 0, 3),
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
    true,
    85,
    'Clasificar al torneo regional'
  ),
  new Player(
    2,
    'Ana Gómez',
    '3017654321',
    'ana.gomez@mail.com',
    false,
    92,
    'Llegar a la final del campeonato'
  ),
  new Player(
    3,
    'Luis Rodríguez',
    '3029876543',
    'luis.rodriguez@mail.com',
    true,
    76,
    'Mejorar el rendimiento del equipo'
  ),
   new Player(
    4,
    'Victor Bedoya',
    '3029876543',
    'luis.rodriguez@mail.com',
    true,
    76,
    'Mejorar el rendimiento del equipo'
  )
  ,
   new Player(
    5,
    'Sandra Gomez',
    '3029876543',
    'luis.rodriguez@mail.com',
    true,
    76,
    'Mejorar el rendimiento del equipo'
  )
];

 predictions: PredictionGame[] = [];



  // Llamamos al método cuando se inicializa el componente
  ngOnInit(): void {
    this. predictions = [
      new PredictionGame(this.players[0], this.games[0], 2, 1),
      new PredictionGame(this.players[1], this.games[0], 1, 1,5),
      new PredictionGame(this.players[2], this.games[1], 3, 2),
      new PredictionGame(this.players[3], this.games[1], 2, 0,10),
      new PredictionGame(this.players[4], this.games[2], 1, 1),
      new PredictionGame(this.players[0], this.games[2], 2, 0),
      new PredictionGame(this.players[1], this.games[3], 4, 1),
      new PredictionGame(this.players[2], this.games[3], 3, 0),
      new PredictionGame(this.players[3], this.games[4], 2, 2),
      new PredictionGame(this.players[4], this.games[4], 1, 0)
    ];
  }

}
