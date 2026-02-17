import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictionTeamPlayer, TeamPhase } from '../../shared/models/team.model';
import { Phase } from '../../shared/models/phase.model';

@Component({
  selector: 'app-groups-table',
  imports: [CommonModule,FormsModule],
  templateUrl: './groups-table.html',
  styleUrl: './groups-table.css',
})
export class GroupsTable {


  @Input() predictions: PredictionTeamPlayer[] = [];
  @Input() teamPhase: TeamPhase[] = [];
  @Input() groups: string[] = [];
  @Input() phase: Phase | undefined;

  predictionsOrderByPlayer: PredictionTeamPlayer[] = [];
  predictionsOrderByTeam: PredictionTeamPlayer[] = [];
  originalGroup: TeamPhase[] = [];
  originalTeams: PredictionTeamPlayer[] = [];

  playerFilter: string = '';
  gameFilter: string = '';
  scoreFilter: string = '';

  editingPlayer: number | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 2;

  highThreshold: number = 0;
  lowThreshold: number = 0;

  idGrupo: string = '';

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
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

    filteredGroups(group: string) {
    if (this.gameFilter) {
      return this.originalGroup.filter(g =>
        (g.team.group == group) &&
        g.team.name.toLowerCase().includes(this.gameFilter.toLowerCase())
      );
    }
    return this.originalGroup.filter(g =>
        g.team.group == group
      );
  }

  getPrediction(playerId: number, teamId: number): string {
    const prediction = this.getPredictionObject(playerId, teamId);
    return prediction ? `${prediction.position}` : '-';
  }

  getPredictionPosition(playerId: number, teamId: number): number {
    const prediction = this.getPredictionObject(playerId, teamId);
    return prediction?.score || 0;
  }

  private getPredictionObject(playerId: number, teamId: number): any {
    return this.predictions.find(p => 
      p.player.id === playerId && p.team.id === teamId
    );
  }

    getScoreClass(playerId: number, teamId: number): string {
    const score = this.getPredictionPosition(playerId, teamId);
    const winnerPoints = this.phase?.classified_points ?? 0;
    if (score == winnerPoints) {
      return 'my-winner';
    }
    return ''; 
  }

  getTotalPoints(playerId: number, group: string): number {

    return this.predictions
      .filter(p => p.player.id === playerId && p.team.group === group)
      .reduce((acc, curr) => acc + (curr.score || 0), 0);      
      
  }

  onResultChange(position: number, teamPhase: TeamPhase, group: string) {
    if (position != null && teamPhase.position != null) {
      let same_team = this.predictions.filter(p => p.team.id === teamPhase.team.id);
      same_team.forEach(team => {
        if(team.team.id == teamPhase.team.id && teamPhase.position == team.position){        
          team.score = this.phase?.classified_points ?? 0;
        }else {
          team.score = 0;             
        }
        team.player.total_score = this.getTotalPoints(team.player.id, group);         
        });
        this.updateScoreByPlayer();
        this.predictions = [...this.predictions];       
      }    
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

    ngOnInit(): void { 
    this.predictionsOrderByTeam = this.predictions
        .filter((prediction, index, array) => 
          index === array.findIndex(p => p.team.id === prediction.team.id))
        .filter((prediction, index, array) => 
          index === array.findIndex(p => p.team.group === prediction.team.group && p.team.group === this.groups[0]))
        .sort((a, b) => a.team.id - b.team.id);
    this.originalTeams =  JSON.parse(JSON.stringify(this.predictionsOrderByTeam));
    this.initComponents();
    const scores = this.filteredPlayers.map(col => col.player.total_score);
    this.highThreshold = this.getPercentile(scores, 80); 
    this.lowThreshold = this.getPercentile(scores, 30); 
   // console.log('JSON predictionsOrderByGame : ', JSON.stringify(this.predictionsOrderByGame, null, 2));
    //console.log('JSON TODAS predictions : ', JSON.stringify(this.predictions, null, 2));
  }

  initComponents(){

      this.originalGroup = this.teamPhase
        .filter((tp, index, self) =>
          index === self.findIndex(t => t.team.id === tp.team.id));
              
        this.predictionsOrderByPlayer = this.predictions 
        .filter(tp => tp.team.group === this.groups[0])
        .filter((tp, index, self) =>
          index === self.findIndex(t => t.player.id === tp.player.id))  
        .sort((a, b) => a.player.id - b.player.id);
        
  }

}
