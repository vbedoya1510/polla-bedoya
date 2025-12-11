import { Team } from "./team.model";

export class Player {
  id: number;
  name: string;
  phone: string;
  email: string;
  pay: boolean;
  total_score: number;
  team_scorer: Team;
  position: number;

constructor(
    id: number,
    name: string,
    phone: string,
    email: string,
    pay: boolean = false,
    total_score: number = 0, 
    team_scorer: Team,
    position: number = 0         
) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.team_scorer = team_scorer;
    this.total_score = total_score;
    this.pay = pay;
    this.position = position;
}


}