import { Component, computed, effect, inject, input, Input, model, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionGame, PredictionTeamPlayer, Team, TeamPhase } from '../../shared/models/team.model';
import { Game } from '../../shared/models/game.model';
import { FormsModule } from '@angular/forms';
import { Phase } from '../../shared/models/phase.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataService } from '../../services/data.service';


@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './results-table.html',
  styleUrls: ['./results-table.css'],
})

export class ResultsTable {
  private dataService = inject(DataService);
  isReady = signal(false);
  playersLocalCopy = signal<any[]>([]);
  predictions = model.required<PredictionGame[]>();
  phase = input<Phase | undefined>();
  predictionsFinals = input<PredictionTeamPlayer[]>([]);
  predictionsPositionsTeams = input<PredictionTeamPlayer[]>([]);
  teamsPositionsFinals = input<TeamPhase[]>([]);
    groups = input<string[]>(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);


  originalGames: PredictionGame[] = [];
  originalPredictions: PredictionGame[] = [];
  predictionsOrderByGame: PredictionGame[] = [];
  predictionsOrderByPlayer: PredictionGame[] = [];

  teams: Team[] = [];
  selectedTeamIds: (number | null)[] = [null, null];

  playerFilter = signal('');
  scoreFilter = signal('');
  gameFilter = signal('');

  editingPlayer: number | null = null;
  editingPrediction: { playerId: number, gameId: number } | null = null;
  tempPrediction: any = { goals_team1: 0, goals_team2: 0 };

  currentPage = signal(1);
  itemsPerPage = 10;

  highThreshold: number = 0;
  lowThreshold: number = 0;
  viewQualified = input<boolean>(false);
  isMainTableVisible = signal(true);
  isTeamsTableVisible = signal(false);
  isFinalsTableVisible = signal(false);


  constructor() {
    effect(() => {
      const original = this.playersList();
      // Solo inicializamos si la copia local está vacía Y hay datos originales
      if (original.length > 0 && untracked(this.playersLocalCopy).length === 0) {
        console.log('Inicializando copia local por primera vez ', this.teamsPositionsFinals());
        //this.playersLocalCopy.set(structuredClone(original));
        this.playersLocalCopy.set(original.map(p => ({
          ...p,
          baseScore: p.player.total_score // Guardamos el puntaje inicial como "ancla"
        })));
      }
    });
    effect(() => {
      const currentPredictions = this.predictions();
      const phase = this.phase();
      if (currentPredictions.length > 0 && phase) {
        untracked(() => {
          let logicChanged = false;

          const updated = currentPredictions.map(p => {
            const g1 = p.game.goals_team1;
            const g2 = p.game.goals_team2;

            // Calculamos el score actual basado en los goles
            let currentScore = 0;
            if (g1 !== null && g2 !== null) {
              if (p.goals_team1 === g1 && p.goals_team2 === g2) {
                currentScore = phase.result_points;
              } else if (
                (g1 > g2 && p.goals_team1 > p.goals_team2) ||
                (g1 < g2 && p.goals_team1 < p.goals_team2) ||
                (g1 === g2 && p.goals_team1 === p.goals_team2)
              ) {
                currentScore = phase.winner_points;
              }
            }
            // if (p?.scoreTeam) {
            //   scoreTeam += p.scoreTeam;
            // }

            // --- LÓGICA DE CONTROL PARA NO REPETIR SUMA ---
            // Si el partido terminó (end_game) y NO ha sido procesado aún
            if (!p.processed && currentScore > 0) {
              logicChanged = true;
              // Retornamos la predicción con el score y la marca de procesado
              return { ...p, score: currentScore, processed: true, scoreTeam: p.scoreTeam || 0 };
            }

            // Si ya estaba procesado o no hay puntos, solo actualizamos el score visual
            return { ...p, score: currentScore, scoreTeam: p.scoreTeam || 0 };
          });

          if (logicChanged) {
            this.predictions.set(updated);
            // Solo disparamos la suma a los jugadores si detectamos nuevos puntos no procesados
            this.refreshAllPlayersInitialScore();
          }
        });
      }
    });
  }

  paginatedPlayers = computed(() => {
    const players = this.playersLocalCopy();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    if (players.length === 0) return [];

    // Transformación: Deep copy + Slice
    // Usamos structuredClone (estándar moderno de JS) en lugar de JSON.parse
    const localCopy = structuredClone(players);

    return localCopy.slice(start, end);
  });

  pages = computed(() => {
    const length = this.totalPages();
    return Array.from({ length }, (_, i) => i + 1);
  });

  updateLocalPoints(playerId: number) {
    const allPreds = this.predictions();

    this.playersLocalCopy.update(currentPlayers => {
      return currentPlayers.map(p => {
        if (p.player.id === playerId) {
          const phasePoints = allPreds
            .filter(pred => pred.player.id === playerId)
            .reduce((sum, pred) => sum + (pred.score || 0) + (pred.scoreTeam || 0), 0);

          return {
            ...p,
            player: {
              ...p.player,
              total_current_phase: phasePoints,
              total_score: (p.baseScore || 0) + phasePoints
            }
          };
        }
        return p;
      });
    });
  }

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

  getPredictionTeam(playerId: number, gameId: number): string {
    const prediction = this.getPredictionObject(playerId, gameId);
    if (playerId == 1 && gameId == 1) {
      console.log('JSON prediction DESPUES: ', JSON.stringify(prediction, null, 2));
    }
    return `${this.getTeamName(prediction)} | ${prediction?.scoreTeam || 0}`;
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
        return { ...p, score: newScore, game: {...realGame} };
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
      this.updateLocalPoints(playerId);
    });
  }

  onTeamChange(teamSelected: any, predictionGame: PredictionGame) {
    if (teamSelected != null) {
      let same_team = this.predictions().filter(p => p.game.id == predictionGame.game.id);
      same_team.forEach(team => {
        if (team.team_qualified == teamSelected) {
          // console.log('JSON teamSelected DESPUES: ', JSON.stringify(team, null, 2));          
          team.scoreTeam = 10;
        } else {
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

  updateScoreByPlayer(playerId: number) {
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
      p.player.id === playerId && p?.phase?.id === this.phase()?.id && p.position === position && p?.finals == true
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
      .filter(p => p.player.id === playerId)
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
    const scores = this.playersList().map(p => p.player.total_score + p.player.total_current_phase);
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
    // 1. Leemos de la copia local (donde sumas los puntos)
    const players = this.playersLocalCopy();
    const pFilter = this.playerFilter().toLowerCase();
    const sFilter = this.scoreFilter();
    const page = this.currentPage();

    // Obtenemos umbrales dinámicos
    const { high, low } = this.thresholds();

    // 2. Filtramos
    let result = players.filter(p =>
      !pFilter || p.player.name.toLowerCase().includes(pFilter)
    );

    // 3. Aplicamos lógica de niveles (opcional según tu UI)
    if (sFilter) {
      result = result.filter(p => {
        const score = p.player.total_score + p.player.total_current_phase;
        if (sFilter === 'high') return score > high;
        if (sFilter === 'medium') return score >= low && score <= high;
        if (sFilter === 'low') return score < low;
        return true;
      });
    }

    // 4. Paginamos (sustituye a paginatedPlayers)
    const startIndex = (page - 1) * this.itemsPerPage;
    return result.slice(startIndex, startIndex + this.itemsPerPage);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.playersList().length / this.itemsPerPage)
  );

  ngOnDestroy() {
    const phase = this.phase();
    const key = `predictions_${phase?.id}`;
    if (this.predictions().length > 0) {
      const dataToStore = {
        games: this.predictions().map(p => ({ ...p, processed: false })),      
        teams: this.predictionsPositionsTeams ? this.predictionsPositionsTeams() : [],      
        finals: this.predictionsFinals()
      };
      sessionStorage.setItem(key, JSON.stringify(dataToStore));
    }


  // 2. ACTUALIZACIÓN DE PUNTOS EN EL SERVICIO (Tu lógica original)
    const dataToSave = this.playersLocalCopy();
    dataToSave.forEach(item => {
      this.dataService.setPlayerAbsoluteScore(
        item.player.id,
        item.player.total_current_phase
      );
    });
  }

  refreshAllPlayersInitialScore() {
    const allPreds = this.predictions();
    const phase = this.phase();
    const isSaved = sessionStorage.getItem('phase_' + phase?.id) !== null;
    if (isSaved) return;
    this.playersLocalCopy.update(players => players.map(p => {
      // Solo sumamos los puntos de las predicciones que tienen el flag processed recién activado
      // o que tengan score pero que estemos seguros que corresponden a esta acción.
      const phasePoints = allPreds
        .filter(pred => pred.player.id === p.player.id)
        .reduce((sum, pred) => sum + (pred.score || 0) + (pred.scoreTeam || 0), 0);

      return {
        ...p,
        player: {
          ...p.player,
          total_current_phase: phasePoints,
          total_score: ((p.baseScore || 0) + phasePoints)
        }
      };
    }));
  }

  getTeamName(prediction: any): string {
    const team = prediction?.team_qualified;
    if (!team) return '-';
    const teamName = this.predictions().find(p => p?.game?.team1.id === team)?.game.team1.name || this.predictions().find(p => p?.game?.team2.id === team)?.game.team2.name;
    return teamName || '-';
  }

  toggleSection(section: string) {
    switch (section) {
      case 'main':
        this.isMainTableVisible.set(!this.isMainTableVisible());
        break;
      case 'teams':
        this.isTeamsTableVisible.set(!this.isTeamsTableVisible());
        break;
      case 'finals':
        this.isFinalsTableVisible.set(!this.isFinalsTableVisible());
        break;
    }
  }

  onSelectedTeamChange(teamSelectedId: any, predictionGame: PredictionGame, playerId: number) {
  // 1. Validaciones iniciales
  const phase = this.phase();
  if (!phase) return;

  // 2. Actualizamos el Signal de predicciones global
  // Esto hará que TODOS los jugadores que acertaron ese equipo reciban puntos
 this.predictions.set([...this.predictions().map(p => {
      let newScore = 0;
      if ((playerId === p.player.id) && (p.game.id === predictionGame.game.id)) {
        if (teamSelectedId && (teamSelectedId == predictionGame?.team_qualified)) {
          newScore = phase.classified_points;
        return { ...p, scoreTeam: newScore }; 
        } else {
          return { ...p, scoreTeam: 0 };
        }
      }
      return p;
    })]);

    const allPreds = this.predictions();

    // Obtenemos los jugadores únicos que están en la tabla actual
    const uniquePlayers = [...new Set(allPreds.map(p => p.player.id))];

    uniquePlayers.forEach(playerId => {
      // Calculamos el total de este jugador sumando todas sus predicciones de esta fase
      const totalPhasePoints = allPreds
        .filter(p => p.player.id === playerId)
        .reduce((sum, p) => sum + (p.score || 0) + (p.scoreTeam || 0), 0);

      // Llamamos al servicio para que el Ranking Global se entere
      this.updateLocalPoints(playerId);
    });
}

getTeamNameByPosition(position: number): string {
  const found = this.teamsPositionsFinals()
    ?.find(tp => tp.position === position);

  return found?.team?.name ?? '-';
}


}
