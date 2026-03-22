import { Phase } from "./phase.model";
import { Team } from "./team.model";

export class Game {
  id: number;
  team1: Team;
  team2: Team;
  goals_team1: number;
  goals_team2: number;
  end_game: boolean = false;
  phase: number;
  team_qualified?: number;

  constructor(
    id: number,
    team1: Team,
    team2: Team,
    goals_team1: number = 0,
    goals_team2: number = 0,
    end_game: boolean = false,
    phase: number = 1,
    team_qualified?: number,
  ) {
    this.id = id;
    this.team1 = team1;
    this.team2 = team2;
    this.goals_team1 = goals_team1;
    this.goals_team2 = goals_team2;
    this.team_qualified = team_qualified;
    this.phase = phase;
    this.end_game = end_game;
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



