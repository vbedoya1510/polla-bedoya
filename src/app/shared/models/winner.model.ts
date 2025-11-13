import { Game } from "./game.model";
import { Phase } from "./phase.model";
import { Player } from "./player.model";

export class WinnerPosition {
  id: number;
  team: string;
  group: number;
  position: number;
  prediction: boolean;

  constructor(
    id: number,
    team: string,
    group: number,
    position: number = 1,
    prediction: boolean = true
  ) {
    this.id = id;
    this.team = team;
    this.group = group;
    this.position = position;
    this.prediction = prediction;
  }
}

export class WinnerPhase {
  winner: WinnerPosition;
  phase: Phase;
    constructor(
      winner: WinnerPosition,
      phase: Phase,
    ) {
      this.winner = winner;
      this.phase = phase;
    } 
}


export class PredictionGame {
  player: Player;
  game: Game;
  goals_team1: number;
  goals_team2: number;
  score: number;
  
    constructor(
      player: Player,
      game: Game,
      goals_team1: number,
      goals_team2: number,
      score: number = 0
    ) {
      this.player = player;
      this.game = game;
      this.goals_team1 = goals_team1;
      this.goals_team2 = goals_team2;
      this.score = score
    } 
}

export class PredictionWinnerPlayer {
  player: Player;
  phase: Phase;
  winnerPosition: WinnerPosition;

    constructor(
      player: Player,
      phase: Phase,
      winnerPosition: WinnerPosition
    ) {
      this.player = player;
      this.phase = phase;
      this.winnerPosition = winnerPosition;
    } 
}