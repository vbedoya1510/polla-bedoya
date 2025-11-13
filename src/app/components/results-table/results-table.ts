import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionGame } from '../../shared/models/winner.model';
import { GamePhase } from '../../shared/models/game.model';
import { Players } from '../../pages/players/players';

@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-table.html',
  styleUrls: ['./results-table.css'],
})
export class ResultsTable {

  @Input() predictions: PredictionGame[] = [];
  @Input() gamePhase: GamePhase[] = [];
 
  predictionsOrderByGame: PredictionGame[] = [];
  predictionsOrderByPlayer: PredictionGame[] = [];

   ngOnInit(): void {
    this.predictionsOrderByGame = this.predictions
    .filter((prediction, index, array) => 
      index === array.findIndex(p => p.game.id === prediction.game.id))
    .sort((a, b) => a.game.id - b.game.id);
    this.predictionsOrderByPlayer = this.predictions    
    .filter((prediction, index, array) => 
      index === array.findIndex(p => p.player.id === prediction.player.id)
    )
    .sort((a, b) => a.player.id - b.player.id);
  }


}
