import { Component, Input } from '@angular/core';
import { PredictionTeamPlayer, Team, TeamPhase } from '../../shared/models/team.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Phase } from '../../shared/models/phase.model';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-finals-table',
  imports: [CommonModule,FormsModule,NgSelectModule],
  templateUrl: './finals-table.html',
  styleUrl: './finals-table.css',
})

export class FinalsTable {

  @Input() predictions: PredictionTeamPlayer[] = [];
  @Input() teams: Team [] = [];
  @Input() phases: Phase [] = [];
  @Input() teamPhase: TeamPhase[] = [];

   originalGroup: PredictionTeamPlayer[] = [];

  predictionsOrderByPlayer: PredictionTeamPlayer[] = [];
  predictionsOrderByTeam: PredictionTeamPlayer[] = [];

  playerFilter: string = '';
  gameFilter: string = '';
  scoreFilter: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 2;

  highThreshold: number = 0;
  lowThreshold: number = 0;

  editingPlayer: number | null = null;

  contador: number = 0;
  col: any;


  selectedTeamIds: (number | null)[] = [null, null, null, null];

  applyFilters() {
    this.currentPage = 1; // Resetear a primera página al filtrar
  }  

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

   // console.log('Cantidad:', this.filteredPlayers.length);
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

      // Métodos de paginación

  get totalPages(): number {
    return Math.ceil(this.predictionsOrderByPlayer.length / this.itemsPerPage);
  }

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

    updateScoreByPlayer(){    
    this.predictionsOrderByPlayer.forEach(player => {
         player.player.total_score = this.predictions.filter(p => p.player.id === player.player.id).reduce((sum, prediction) => sum + prediction.score, 0);
      });      
      this.predictions = [...this.predictions];    
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

  filteredGroups(idPhase: number) {
    if (this.gameFilter) {
      return this.originalGroup.filter(g =>
        (g.phase.id == idPhase) &&
        g.team.name.toLowerCase().includes(this.gameFilter.toLowerCase())
      );
    }
    const data = this.originalGroup.filter(g =>
        g.phase.id == idPhase
      );
    return data
  }

   getScoreClass(playerId: number, position: number, phase: number): string {
    const score = this.getPredictionPosition(playerId, position, phase);
    if (score > 0) {
      return 'my-winner';
    }
    return ''; 
  }

  getPrediction(playerId: number, position: number, phase: number): string {       
    const prediction = this.getPredictionObject(playerId, position, phase);
    return prediction ? `${prediction.team.name}` : '-';
  }

  getPredictionPosition(playerId: number, position: number, phase: number): number {
    const prediction = this.getPredictionObject(playerId, position, phase);
    return prediction?.score || 0;
  }

  getTotalPoints(playerId: number, phase: number): number {
    return this.predictions
      .filter(p => p.player.id === playerId && p.phase.id === phase)
      .reduce((acc, curr) => acc + (curr.score || 0), 0);  
  }
    private getPredictionObject(playerId: number, position: number, phase: number): any {
       const prediction = this.predictions.find(p => 
      p.player.id === playerId && p.phase.id === phase && p.position === position && p.finals==true
    );  

    return prediction;
  }

  onTeamChange(teamSelected: any, position: number) {
    if (teamSelected != null && position != null) {

      let same_position = this.predictions.filter(p => p.position === position);
      same_position.forEach(team => {
        team.score = 0; 
      });

      let same_team = this.predictions.filter(p => p.team.id === teamSelected);
      same_team.forEach(team => {
        team.score = 0;      
        if(team.position == position){ 
          this.phases.forEach(phase => {
            if(phase.id == team.phase.id){
              team.score = phase.finalist_points ?? 0;
            }
          }); 
        }else {
          team.score = 0;             
        }              
      });
      this.updateScoreByPlayer();
      this.predictions = [...this.predictions];       
    }    
  }

  ngOnInit(): void { 
    this.predictionsOrderByTeam = this.predictions
        .filter((prediction, index, array) => 
          index === array.findIndex(p => p.team.id === prediction.team.id))
        .filter((prediction, index, array) => 
          index === array.findIndex(p => p.team.group === prediction.team.group))
        .sort((a, b) => a.team.id - b.team.id);
    // this.originalTeams =  JSON.parse(JSON.stringify(this.predictionsOrderByTeam));
    this.initComponents();
    const scores = this.filteredPlayers.map(col => col.player.total_score);
    this.highThreshold = this.getPercentile(scores, 80); 
    this.lowThreshold = this.getPercentile(scores, 30); 
   // console.log('JSON predictionsOrderByGame : ', JSON.stringify(this.predictionsOrderByGame, null, 2));
  }

  initComponents(){
        this.originalGroup = this.predictions
        .filter((tp, index, self) =>
          index === self.findIndex(t => t.team.id === tp.team.id && tp.finals == true));   

        this.predictionsOrderByPlayer = this.predictions 
        .filter((tp, index, self) =>
          index === self.findIndex(t => t.player.id === tp.player.id))  
        .sort((a, b) => a.player.id - b.player.id);


        //console.log('JSON predictionsOrderByPlayer : ', JSON.stringify(this.predictionsOrderByPlayer, null, 2));



  }
}
