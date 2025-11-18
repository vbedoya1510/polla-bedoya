import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionGame } from '../../shared/models/winner.model';
import { Game, GamePhase } from '../../shared/models/game.model';
import { FormsModule } from '@angular/forms';
import { Player } from '../../shared/models/player.model';
import { Phase } from '../../shared/models/phase.model';


@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './results-table.html',
  styleUrls: ['./results-table.css'],
})

export class ResultsTable {

  @Input() predictions: PredictionGame[] = [];
  @Input() gamePhase: GamePhase[] = [];
  @Input() phase: Phase | undefined;

 
  originalGames: PredictionGame[] = [];
  originalPredictions: PredictionGame[] = [];
  predictionsOrderByGame: PredictionGame[] = [];
  predictionsOrderByPlayer: PredictionGame[] = [];

  playerFilter: string = '';
  gameFilter: string = '';
  scoreFilter: string = '';

  editingPlayer: number | null = null;
  editingPrediction: {playerId: number, gameId: number} | null = null;
  tempPrediction: any = { goals_team1: 0, goals_team2: 0 };

  currentPage: number = 1;
  itemsPerPage: number = 10;

  highThreshold: number = 0;
  lowThreshold: number = 0;


  get filteredPlayers() {
    let filtered = this.predictionsOrderByPlayer;
    
    if (this.playerFilter) {
      filtered = filtered.filter(p => 
        p.player.name.toLowerCase().includes(this.playerFilter.toLowerCase())
      );
    }
    
    if (this.scoreFilter) {
      filtered = filtered.filter(p => {
        switch(this.scoreFilter) {
          case 'high': return p.player.total_score > this.highThreshold;
          case 'medium': return p.player.total_score >= this.lowThreshold && p.player.total_score <= this.highThreshold;
          case 'low': return p.player.total_score < this.lowThreshold;
          default: return true;
        }
      });
    }
    
    // Paginación
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

    get filteredGames() {
    if (this.gameFilter) {
      return this.originalGames.filter(g =>
        g.game.team1.toLowerCase().includes(this.gameFilter.toLowerCase()) ||
        g.game.team2.toLowerCase().includes(this.gameFilter.toLowerCase())
      );
    }
    return this.originalGames;
  }

  get totalPages(): number {
    return Math.ceil(this.predictionsOrderByPlayer.length / this.itemsPerPage);
  }

  
  // Métodos de edición
  startEditingPlayer(playerId: number) {
    this.editingPlayer = playerId;
  }

  savePlayerName(player: any) {
    // Aquí puedes hacer una llamada HTTP para guardar
    console.log('Guardando jugador:', player);
    this.editingPlayer = null;
  }

  startEditingPrediction(playerId: number, gameId: number) {
    const prediction = this.getPredictionObject(playerId, gameId);
    this.tempPrediction = { 
      goals_team1: prediction?.goals_team1 || 0, 
      goals_team2: prediction?.goals_team2 || 0 
    };
    this.editingPrediction = { playerId, gameId };
  }

  getPrediction(playerId: number, gameId: number): string {
    const prediction = this.getPredictionObject(playerId, gameId);
    return prediction ? `${prediction.goals_team1} - ${prediction.goals_team2}` : '-';
  }

  getPredictionScore(playerId: number, gameId: number): number {
    const prediction = this.getPredictionObject(playerId, gameId);
    return prediction?.score || 0;
  }

  private getPredictionObject(playerId: number, gameId: number): any {
    return this.predictions.find(p => 
      p.player.id === playerId && p.game.id === gameId
    );
  }

  // Métodos de paginación
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  applyFilters() {
    this.currentPage = 1; // Resetear a primera página al filtrar
  }

onResultChange(game: Game, predictionGame: PredictionGame) {
  if (game != null && predictionGame.game.goals_team1 != null && predictionGame.game.goals_team2 != null) {
    let same_match = this.predictions.filter(p => p.game.id === predictionGame.game.id);
    same_match.forEach(match => {
      if(match.game.id == predictionGame.game.id){
        if(predictionGame.game.goals_team1 == match.goals_team1 && predictionGame.game.goals_team2 == match.goals_team2){
          match.score = this.phase?.result_points ?? 0;
        }else if((predictionGame.game.goals_team1 > predictionGame.game.goals_team2 && match.goals_team1 > match.goals_team2)
          || (predictionGame.game.goals_team1 < predictionGame.game.goals_team2 && match.goals_team1 < match.goals_team2)
          || (predictionGame.game.goals_team1 == predictionGame.game.goals_team2 && match.goals_team1 == match.goals_team2)
          ){
            match.score = this.phase?.winner_points ?? 0;        
          }else{
            match.score = 0;
          }   
      }             
      });
      this.updateScoreByPlayer();
      this.predictions = [...this.predictions];    
 
    }    
  }

  updateScoreByPlayer(){
    
    this.predictionsOrderByPlayer.forEach(player => {
         player.player.total_score = this.predictions.filter(p => p.player.id === player.player.id).reduce((sum, prediction) => sum + prediction.score, 0);
    });      
      this.predictions = [...this.predictions];    
  }

  getScoreClass(playerId: number, gameId: number): string {
    const score = this.getPredictionScore(playerId, gameId);
    const resultPoints = this.phase?.result_points ?? 0;
    const winnerPoints = this.phase?.winner_points ?? 0;

    if (score >= resultPoints) {
      return 'my-result';
    } else if (score >= winnerPoints) {
      return 'my-winner';
    }
    return ''; 
  }

  getPercentile(scores: number[], percentile: number): number {
  const sorted = [...scores].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = lower + 1;
  const weight = index % 1;

  if (upper >= sorted.length) return sorted[sorted.length - 1];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

   ngOnInit(): void {
    this.predictionsOrderByGame = this.predictions
        .filter((prediction, index, array) => 
          index === array.findIndex(p => p.game.id === prediction.game.id))
        .sort((a, b) => a.game.id - b.game.id);
    
    this.originalGames =  JSON.parse(JSON.stringify(this.predictionsOrderByGame));
    this.initComponents();
    const scores = this.filteredPlayers.map(col => col.player.total_score);
    this.highThreshold = this.getPercentile(scores, 80); 
    this.lowThreshold = this.getPercentile(scores, 30);  
   // console.log('JSON predictionsOrderByGame : ', JSON.stringify(this.predictionsOrderByGame, null, 2));
   //console.log('JSON TODAS predictions : ', JSON.stringify(this.predictions, null, 2));
  }

  initComponents(){

        this.predictionsOrderByPlayer = this.predictions    
        .filter((prediction, index, array) => 
          index === array.findIndex(p => p.player.id === prediction.player.id)
        )
        .sort((a, b) => a.player.id - b.player.id);

        this.originalPredictions = JSON.parse(JSON.stringify(this.predictions));
  }


}
