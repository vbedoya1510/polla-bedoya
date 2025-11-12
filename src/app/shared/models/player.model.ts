export class Player {
  id: number;
  name: string;
  phone: string;
  email: string;
  pay: boolean = false;
  total_score: number = 0;
  team_goal: string;

constructor(
    id: number,
    name: string,
    phone: string,
    email: string,
    team_goal: string,
    pay: boolean = false   // opcional, por defecto false
) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.team_goal = team_goal;
    this.pay = pay;
}


}