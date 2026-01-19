import { Component, computed, inject, input, Input, model, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionGame, PredictionTeamPlayer, Team } from '../../shared/models/team.model';
import { Game } from '../../shared/models/game.model';
import { FormsModule } from '@angular/forms';
import { Phase } from '../../shared/models/phase.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataService } from '../../services/data.service';


@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [CommonModule,FormsModule,NgSelectModule],
  templateUrl: './results-table.html',
  styleUrls: ['./results-table.css'],
})

export class ResultsTable {
private dataService = inject(DataService);
predictions = model.required<PredictionGame[]>();
  phase = input<Phase | undefined>();
  predictionsFinals = input<PredictionTeamPlayer[]>([]);

 
  originalGames: PredictionGame[] = [];
  originalPredictions: PredictionGame[] = [];
  predictionsOrderByGame: PredictionGame[] = [];
  predictionsOrderByPlayer: PredictionGame[] = [];

  teams: Team [] = [];
  selectedTeamIds: (number | null)[] = [null, null];

  playerFilter = signal('');
  scoreFilter = signal('');
  gameFilter = signal('');

  editingPlayer: number | null = null;
  editingPrediction: {playerId: number, gameId: number} | null = null;
  tempPrediction: any = { goals_team1: 0, goals_team2: 0 };

  currentPage = signal(1);
  itemsPerPage = 10;

  highThreshold: number = 0;
  lowThreshold: number = 0;
  viewQualified: boolean = false;

  //get filteredPlayers() {
    //let filtered = this.playersList;
    
    // if (this.playerFilter) {
    //   filtered = filtered().filter(p => 
    //     p.player.name.toLowerCase().includes(this.playerFilter.toLowerCase())
    //   );
    // }
    
    // if (this.scoreFilter) {
    //   filtered = filtered.filter(p => {
    //     switch(this.scoreFilter) {
    //       case 'high': return p.player.total_score > this.highThreshold;
    //       case 'medium': return p.player.total_score >= this.lowThreshold && p.player.total_score <= this.highThreshold;
    //       case 'low': return p.player.total_score < this.lowThreshold;
    //       default: return true;
    //     }
    //   });
    // }
    
    // Paginación
    // const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // return filtered.slice(startIndex, startIndex + this.itemsPerPage);
 // }

  get filteredGames() {
    if (this.gameFilter) {
      return this.originalGames.filter(g =>
        g.game.team1.name.toLowerCase().includes(this.gameFilter().toLowerCase()) ||
        g.game.team2.name.toLowerCase().includes(this.gameFilter().toLowerCase())
      );
    }
    return this.originalGames;
  }

  // get totalPages(): number {
  //   return Math.ceil(this.predictionsOrderByPlayer.length / this.itemsPerPage);
  // }

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
    return this.predictions().find(p => 
      p.player.id == playerId && p.game.id == gameId
    );
  }  

  getPredictionTeam(playerId: number, gameId: number): number {
    const prediction = this.getPredictionObject(playerId, gameId);
    if(playerId==1 && gameId==1){
       console.log('JSON prediction DESPUES: ', JSON.stringify(prediction, null, 2));         
    }
    return prediction?.team_qualified?.name || '';
  }

    // Métodos de paginación
  nextPage() {
  // .update() es ideal para cambios que dependen del valor anterior
  if (this.currentPage() < this.totalPages()) {
    this.currentPage.update(page => page + 1);
  }
}

previousPage() {
  if (this.currentPage() > 1) {
    this.currentPage.update(page => page - 1);
  }
}

goToPage(page: number) {
  // .set() es ideal para asignar un valor directo
  this.currentPage.set(page);
}

  applyFilters() {
    this.currentPage.set(1); 
  }

// onResultChange(game: Game, predictionGame: PredictionGame) {
//   if (game != null && predictionGame.game.goals_team1 != null && predictionGame.game.goals_team2 != null) {
//     let same_match = this.predictions().filter(p => p.game.id === predictionGame.game.id);
//     same_match.forEach(match => {
//       if(match.game.id == predictionGame.game.id){
//         if(predictionGame.game.goals_team1 == match.goals_team1 && predictionGame.game.goals_team2 == match.goals_team2){
//           match.score = this.phase()?.result_points ?? 0;
//         }else if((predictionGame.game.goals_team1 > predictionGame.game.goals_team2 && match.goals_team1 > match.goals_team2)
//           || (predictionGame.game.goals_team1 < predictionGame.game.goals_team2 && match.goals_team1 < match.goals_team2)
//           || (predictionGame.game.goals_team1 == predictionGame.game.goals_team2 && match.goals_team1 == match.goals_team2)
//           ){
//             match.score = this.phase()?.winner_points ?? 0;        
//           }else{
//             match.score = 0;
//           }   
//       }             
//       });
//       //this.updateScoreByPlayer();
//       const newTotal = this.updateScoreByPlayer(predictionGame.player.id);
//       this.dataService.updatePlayerScore(predictionGame.player.id, newTotal);
//       //this.predictions = [...this.predictions];    
 
//     }    
//   }

updateGoals(realGame: Game, event: any, team: 'team1' | 'team2') {
  if (!realGame) return;
  const val = parseInt(event.target.value, 10);
  if (isNaN(val)) return;

  // Actualizamos el objeto localmente primero
  if (team === 'team1') realGame.goals_team1 = val;
  else realGame.goals_team2 = val;

  // Ahora ejecutamos la lógica de puntos
  this.onResultChange(realGame);
}

onResultChange(realGame: Game) {
  const g1 = realGame.goals_team1;
  const g2 = realGame.goals_team2;
  const phase = this.phase();

  if (g1 === null || g2 === null || !phase) return;

  // 1. Calculamos el nuevo estado de las predicciones basándonos en el resultado real
  // IMPORTANTE: Usamos .update() para que Angular detecte el cambio de estado
  // No necesitamos 'set', usamos una lógica inmutable
  
  // Aquí puedes llamar a una función en el servicio o actualizar localmente 
  // si el input fuera un model(), pero como es input(), 
  // lo ideal es que el PADRE actualice los datos.
  
  // Si quieres que funcione inmediato para la vista:
  this.predictions.set([...this.predictions().map(p => {
    if (p.game.id === realGame.id) {
      let newScore = 0;
      // Lógica de cálculo
      if (p.goals_team1 === g1 && p.goals_team2 === g2) {
        newScore = phase.result_points;
      } else if (
        (g1 > g2 && p.goals_team1 > p.goals_team2) ||
        (g1 < g2 && p.goals_team1 < p.goals_team2) ||
        (g1 === g2 && p.goals_team1 === p.goals_team2)
      ) {
        newScore = phase.winner_points;
      }
      return { ...p, score: newScore };
    }
    return p;
  })]);
  const updatedPredictions = this.predictions();
  
  // Obtenemos los jugadores únicos afectados para actualizar sus puntos
  const playerIds = [...new Set(updatedPredictions.map(p => p.player.id))];

  const allPreds = this.predictions();
  
  // Obtenemos los jugadores únicos que están en la tabla actual
  const uniquePlayers = [...new Set(allPreds.map(p => p.player.id))];

  uniquePlayers.forEach(playerId => {
    // Calculamos el total de este jugador sumando todas sus predicciones de esta fase
    const totalPhasePoints = allPreds
      .filter(p => p.player.id === playerId)
      .reduce((sum, p) => sum + (p.score || 0) + (p.scoreTeam || 0), 0);

    // Llamamos al servicio para que el Ranking Global se entere
    //this.dataService.updatePlayerScore(playerId, totalPhasePoints);
  });
}

  onTeamChange(teamSelected: any, predictionGame: PredictionGame) {
    if (teamSelected != null) {
       let same_team = this.predictions().filter(p => p.game.id == predictionGame.game.id);
        same_team.forEach(team => {         
          if (team.team_qualified?.id == teamSelected){    
            // console.log('JSON teamSelected DESPUES: ', JSON.stringify(team, null, 2));          
            team.scoreTeam = this.phase()?.classified_points ?? 0;        
          }else{
            team.scoreTeam = 0;
          }                    
        });
        const newTotal = this.updateScoreByPlayer(predictionGame.player.id);
      this.dataService.updatePlayerScore(predictionGame.player.id, newTotal);
        //this.predictions = [...this.predictions];  
    }    
  } 

  getTotalPoints(playerId: number): number {
    return this.predictions()
      .filter(p => p.player.id === playerId)
      .reduce((acc, curr) => acc + (curr.scoreTeam || 0), 0);  
  }

  updateScoreByPlayer(playerId: number){   
    // this.predictionsOrderByPlayer.forEach(player => {
    //      player.player.total_score = this.predictions().filter(p => p.player.id === player.player.id).reduce((sum, prediction) => sum + prediction.score + prediction.scoreTeam, 0);
    // }); 
    return this.predictions()
    .filter(p => p.player.id === playerId)
    .reduce((sum, p) => sum + (p.score || 0) + (p.scoreTeam || 0), 0);     
      //this.predictions = [...this.predictions];    
  }

  getScoreClass(playerId: number, gameId: number): string {
    const score = this.getPredictionScore(playerId, gameId);
    const resultPoints = this.phase()?.result_points ?? 0;
    const winnerPoints = this.phase()?.winner_points ?? 0;
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
       const prediction = this.predictionsFinals().find(p => 
      p.player.id === playerId && p.phase.id === this.phase()?.id && p.position === position && p.finals==true
    );  
     return prediction;
  }

  getScoreClassTeam(playerId: number, gameId: number): string {
    const score = this.getPredictionScoreTeam(playerId, gameId);
    const classifiedPoints = this.phase()?.classified_points ?? 0;
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
    return this.predictionsFinals()
      .filter(p => p.player.id === playerId && p.phase.id === this.phase()?.id)
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

  //  ngOnInit(): void {
  //   this.predictionsOrderByGame = this.predictions
  //       .filter((prediction, index, array) => 
  //         index === array.findIndex(p => p.game.id === prediction.game.id))
  //       .sort((a, b) => a.game.id - b.game.id);
    
  //   this.originalGames =  JSON.parse(JSON.stringify(this.predictionsOrderByGame));

  //   this.initComponents();
  //   const scores = this.filteredPlayers.map(col => col.player.total_score);
  //   this.highThreshold = this.getPercentile(scores, 80); 
  //   this.lowThreshold = this.getPercentile(scores, 30);  
  //  // console.log('JSON predictionsOrderByGame : ', JSON.stringify(this.predictionsOrderByGame, null, 2));
  //  //console.log('JSON TODAS predictions : ', JSON.stringify(this.predictions, null, 2));
  // }

  // readonly gamesList = computed(() => {
  //   return this.predictions()
  //     .filter((p, i, arr) => arr.findIndex(x => x.game.id === p.game.id) === i)
  //     .sort((a, b) => a.game.id - b.game.id);
  // });

// En el componente.ts
// Cambiamos la dependencia: ya no mira 'predictions', mira 'worldCupData'
// En results-table.ts

// 1. Obtener la lista de juegos únicos a partir de las predicciones recibidas
readonly gamesList = computed(() => {
  const allPredictions = this.predictions();
  if (allPredictions.length === 0) return [];

  // Extraemos juegos únicos basándonos en el ID del juego
  const seenGames = new Set();
  const uniqueGames: PredictionGame[] = [];

  for (const p of allPredictions) {
    if (!seenGames.has(p.game.id)) {
      seenGames.add(p.game.id);
      uniqueGames.push(p);
    }
  }

  return uniqueGames.sort((a, b) => a.game.id - b.game.id);
});

  // Umbrales reactivos
  readonly thresholds = computed(() => {
    const scores = this.playersList().map(p => p.player.total_score);
    if (scores.length === 0) return { high: 0, low: 0 };
    return {
      high: this.getPercentile(scores, 80),
      low: this.getPercentile(scores, 30)
    };
  });

  readonly playersList = computed(() => {
    const all = this.predictions();
    return all
      .filter((p, i, arr) => arr.findIndex(x => x.player.id === p.player.id) === i)
      .sort((a, b) => a.player.id - b.player.id);
  });

  readonly filteredPlayers = computed(() => {
  const players = this.playersList();
  const pFilter = this.playerFilter().toLowerCase();
  const sFilter = this.scoreFilter();
  const { high, low } = this.thresholds();
  const page = this.currentPage();

  let filtered = players.filter(p => 
    !pFilter || p.player.name.toLowerCase().includes(pFilter)
  );

  if (sFilter) {
    filtered = filtered.filter(p => {
      const score = p.player.total_score;
      if (sFilter === 'high') return score > high;
      if (sFilter === 'medium') return score >= low && score <= high;
      if (sFilter === 'low') return score < low;
      return true;
    });
  }

  const startIndex = (page - 1) * this.itemsPerPage;
  return filtered.slice(startIndex, startIndex + this.itemsPerPage);
});

readonly totalPages = computed(() => 
  Math.ceil(this.playersList().length / this.itemsPerPage)
);

}
