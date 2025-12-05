import { Phase } from "./phase.model";
import { Team } from "./team.model";

export class Game {
  id: number;
  team1: Team;
  team2: Team;
  goals_team1: number;
  goals_team2: number;
  team_qualified?: Team;
  end_game: boolean = false;

  constructor(
    id: number,
    team1: Team,
    team2: Team,
    goals_team1: number = 0,
    goals_team2: number = 0,
    team_qualified?: Team
  ) {
    this.id = id;
    this.team1 = team1;
    this.team2 = team2;
    this.goals_team1 = goals_team1;
    this.goals_team2 = goals_team2;
    this.team_qualified = team_qualified;
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



