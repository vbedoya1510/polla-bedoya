export class Phase {
  id: number;
  classified_points: number;
  finalist_points: number;
  result_points: number;
  winner_points: number;
  winner_scorer: number;
  goal_points: number;

constructor(
    id: number,
    classified_points: number,
    finalist_points: number,
    result_points: number,
    winner_points: number,
    winner_scorer: number,
    goal_points: number = 0,
  ) {
    this.id = id;
    this.classified_points = classified_points;
    this.finalist_points = finalist_points;
    this.result_points = result_points;
    this.winner_points = winner_points;
    this.winner_scorer = winner_scorer;
    this.goal_points = goal_points;
  }
}