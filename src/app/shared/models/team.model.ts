import { Game } from "./game.model";
import { Phase } from "./phase.model";
import { Player } from "./player.model";

export class Team {
  id: number;
  name: string;
  group: string;
  position: number;

  constructor(
    id: number,
    name: string,
    group: string,
    position: number = 0
  ) {
    this.id = id;
    this.name = name;
    this.group = group;
    this.position = position;
  }
}

export class PredictionGame {
  player: Player;
  game: Game;
  goals_team1: number;
  goals_team2: number;
  score: number;
  scoreTeam: number;
  team_qualified?: Team;
  selectedTeamId: any;
  processed?: boolean = false;
  
    constructor(
      player: Player,
      game: Game,
      goals_team1: number,
      goals_team2: number,
      score: number = 0,
      scoreTeam: number = 0,
      team_qualified?: Team
    ) {
      this.player = player;
      this.game = game;
      this.goals_team1 = goals_team1;
      this.goals_team2 = goals_team2;
      this.score = score;
      this.scoreTeam = scoreTeam;
      this.team_qualified = team_qualified
    } 
}

export class NPredictionGame {
  idPlayer: number;
  idGame: number;
  goals_team1: number;
  goals_team2: number;
  team_qualified?: Team;
  
    constructor(
      idPlayer: number,
      idGame: number,
      goals_team1: number,
      goals_team2: number
    ) {
      this.idPlayer = idPlayer;
      this.idGame = idGame;
      this.goals_team1 = goals_team1;
      this.goals_team2 = goals_team2;
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

export class NPredictionTeam {
  idPlayer: number;
  idPhase: number;
  idTeam: number;
  position: number;
  
    constructor(
      idPlayer: number,
      idPhase: number,
      idTeam: number,
      position: number
    ) {
      this.idPlayer = idPlayer;
      this.idPhase = idPhase;
      this.idTeam = idTeam;
      this.position = position
    } 
}


