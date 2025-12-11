import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionGame, PredictionTeamPlayer, Team } from '../../shared/models/team.model';
import { Game } from '../../shared/models/game.model';
import { FormsModule } from '@angular/forms';
import { Phase } from '../../shared/models/phase.model';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [CommonModule,FormsModule,NgSelectModule],
  templateUrl: './results-table.html',
  styleUrls: ['./results-table.css'],
})

export class ResultsTable {

  @Input() predictions: PredictionGame[] = [];
  @Input() phase: Phase | undefined;
  @Input() predictionsFinals: PredictionTeamPlayer[] = [];

 
  originalGames: PredictionGame[] = [];
  originalPredictions: PredictionGame[] = [];
  predictionsOrderByGame: PredictionGame[] = [];
  predictionsOrderByPlayer: PredictionGame[] = [];

  teams: Team [] = [];
  selectedTeamIds: (number | null)[] = [null, null];

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
  viewQualified: boolean = false;

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
        g.game.team1.name.toLowerCase().includes(this.gameFilter.toLowerCase()) ||
        g.game.team2.name.toLowerCase().includes(this.gameFilter.toLowerCase())
      );
    }
    return this.originalGames;
  }

  get totalPages(): number {
    return Math.ceil(this.predictionsOrderByPlayer.length / this.itemsPerPage);
  }

  getPrediction(playerId: number, gameId: number): string {
    const prediction = this.getPredictionObject(playerId, gameId);
    return prediction ? `${prediction.goals_team1} - ${prediction.goals_team2}` : '-';
  }

  getPredictionScore(playerId: number, gameId: number): number {
    const prediction = this.getPredictionObject(playerId, gameId);
    return prediction?.score || 0;
  }

  getPredictionScoreTeam(playerId: number, gameId: number): number {
    const prediction = this.getPredictionObject(playerId, gameId);
    return prediction?.scoreTeam || 0;
  }

  private getPredictionObject(playerId: number, gameId: number): any {
    return this.predictions.find(p => 
      p.player.id === playerId && p.game.id === gameId
    );
  }  

  getPredictionTeam(playerId: number, gameId: number): number {
    const prediction = this.getPredictionObject(playerId, gameId);
    return prediction?.team_qualified?.name || '';
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
    this.currentPage = 1; 
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

  onTeamChange(teamSelected: any, predictionGame: PredictionGame) {
    if (teamSelected != null) {
       let same_team = this.predictions.filter(p => p.game.id == predictionGame.game.id);
        same_team.forEach(team => {         
          if (team.team_qualified?.id == teamSelected){    
            // console.log('JSON teamSelected DESPUES: ', JSON.stringify(team, null, 2));          
            team.scoreTeam = this.phase?.classified_points ?? 0;        
          }else{
            team.scoreTeam = 0;
          }                    
        });
        this.updateScoreByPlayer();
        this.predictions = [...this.predictions];  
    }    
  } 

  getTotalPoints(playerId: number): number {
    return this.predictions
      .filter(p => p.player.id === playerId)
      .reduce((acc, curr) => acc + (curr.scoreTeam || 0), 0);  
  }

  updateScoreByPlayer(){    
    this.predictionsOrderByPlayer.forEach(player => {
         player.player.total_score = this.predictions.filter(p => p.player.id === player.player.id).reduce((sum, prediction) => sum + prediction.score + prediction.scoreTeam, 0);
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

  getScoreClassFinals(playerId: number, position: number): string {
    const score = this.getPredictionPositionFinals(playerId, position);
    if (score > 0) {
      return 'my-winner';
    }
    return ''; 
  }

  getPredictionPositionFinals(playerId: number, position: number): number {
    const prediction = this.getPredictionObjectFinals(playerId, position);
    return prediction?.score || 0;
  }

  private getPredictionObjectFinals(playerId: number, position: number): any {
       const prediction = this.predictionsFinals.find(p => 
      p.player.id === playerId && p.phase.id === this.phase?.id && p.position === position && p.finals==true
    );  
     return prediction;
  }

  getScoreClassTeam(playerId: number, gameId: number): string {
    const score = this.getPredictionScoreTeam(playerId, gameId);
    const classifiedPoints = this.phase?.classified_points ?? 0;
    if (score >= classifiedPoints) {
      return 'my-winner';
    } 
    return ''; 
  }

  getPredictionFinals(playerId: number, position: number): string {       
    const prediction = this.getPredictionObjectFinals(playerId, position);    
    return prediction ? `${prediction.team.name}` : '-';
  }

  getTotalPointsFinals(playerId: number): number {
    return this.predictionsFinals
      .filter(p => p.player.id === playerId && p.phase.id === this.phase?.id)
      .reduce((acc, curr) => acc + (curr.score || 0), 0);  
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
        this.viewQualified = this.phase?.id == 1? false : true
        this.predictionsOrderByPlayer = this.predictions    
        .filter((prediction, index, array) => 
          index === array.findIndex(p => p.player.id === prediction.player.id)
        )
        .sort((a, b) => a.player.id - b.player.id);
        
        this.originalPredictions = JSON.parse(JSON.stringify(this.predictions)); 
  }


}
