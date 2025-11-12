import { Phase } from "./phase.model";

export class Game {
  id: number;
  team1: string;
  team2: string;
  goals_team1: number;
  goals_team2: number;

  constructor(
    id: number,
    team1: string,
    team2: string,
    goals_team1: number = 0,
    goals_team2: number = 0
  ) {
    this.id = id;
    this.team1 = team1;
    this.team2 = team2;
    this.goals_team1 = goals_team1;
    this.goals_team2 = goals_team2;
  }
}


export class GamePhase {
  game: Game;
  phase: Phase;

  constructor(
    game: Game,
    phase: Phase,
  ) {
    this.game = game;
    this.phase = phase;
  }
}



