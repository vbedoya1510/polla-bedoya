import { Game } from "./game.model";
import { Phase } from "./phase.model";
import { Player } from "./player.model";

export class Team {
  id: number;
  name: string;
  group: string;

  constructor(
    id: number,
    name: string,
    group: string
  ) {
    this.id = id;
    this.name = name;
    this.group = group;
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

export class TeamPhase {
  phase: Phase;
  team: Team;
  position: number;
  end_position: boolean = false;

    constructor(
      phase: Phase,
      team: Team,
      position: number
    ) {
      this.phase = phase;
      this.team = team;
      this.position = position;
    } 
}

export class PredictionTeamPlayer {
  player: Player;
  phase: Phase;
  team: Team;
  position: number;
  score: number;
  finals: boolean;

    constructor(
      player: Player,
      phase: Phase,
      team: Team,
      position: number,
      score: number = 0,
      finals: boolean
    ) {
      this.player = player;
      this.phase = phase;
      this.team = team;
      this.position = position; 
      this.score = score;  
      this.finals = finals;   
    } 
}