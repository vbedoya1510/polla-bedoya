import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { Player } from '../../shared/models/player.model';
import { NPredictionTeam, Team } from '../../shared/models/team.model';
import { Phase } from '../../shared/models/phase.model';
import { NDataService } from '../../services/ndata.service';

interface TeamRow {
  team: Team;
  realPosition: number;
  edited: boolean;
  playerPredictions: {
    player: Player;
    predictedPosition: number;
    points: number;
    correct: boolean;
    fullGroupMatch: boolean;
  }[];
}

interface GroupRow {
  group: string;
  teams: TeamRow[];
}

@Component({
  selector: 'app-ngroups-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ngroups-table.html',
  styleUrls: ['./ngroups-table.css'],
})
export class NgroupsTable implements OnInit, OnChanges, OnDestroy {
  @Input() teams: Team[] = [];
  @Input() players: Player[] = [];
  @Input() predictionTeam: NPredictionTeam[] = [];
  @Input() phase?: Phase;

  groupRows: GroupRow[] = [];
  playerPhaseScores: Map<number, number> = new Map();

  private scoreChange$ = new Subject<void>();

  constructor(private dataService: NDataService) { }

  ngOnInit() {
    this.scoreChange$
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.persistScores();
        this.saveEditsToStorage();
      });
  }

  ngOnDestroy() {
    this.saveEditsToStorage();
    this.scoreChange$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    const allReady = this.teams.length > 0
      && this.players.length > 0
      && this.predictionTeam.length > 0
      && this.phase;

    if (allReady && this.groupRows.length === 0) {
      this.buildTable();
    }
  }


  private buildTable() {

    // Agrupar equipos por grupo
    const groupMap = new Map<string, Team[]>();
    this.teams.forEach(team => {
      if (!groupMap.has(team.group)) groupMap.set(team.group, []);
      groupMap.get(team.group)!.push(team);
    });

    this.groupRows = Array.from(groupMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([group, teams]) => ({
        group,
        teams: teams.map(team => ({
          team,
          realPosition: 0,
          edited: false,
          playerPredictions: this.players.map(player => {
            const pred = this.predictionTeam.find(
              p => p.idPlayer === player.id && p.idTeam === team.id
            );
            return {
              player,
              predictedPosition: pred?.position ?? 0,
              points: 0,
              correct: false,
              fullGroupMatch: false
            };
          })
        }))
      }));

    this.recalculateAllScores();
    this.restoreEditsFromStorage();
  }

  onPositionChange(teamRow: TeamRow, groupRow: GroupRow) {
    teamRow.edited = true;

    teamRow.playerPredictions = teamRow.playerPredictions.map(pp => {
      const correct = teamRow.realPosition > 0 && pp.predictedPosition === teamRow.realPosition;
      return { ...pp, correct, points: correct ? (this.phase?.classified_points ?? 0) : 0 };
    });

    this.checkFullGroupMatch(groupRow);
    this.recalculateAllScores();
    this.scoreChange$.next();
  }

  private recalculateAllScores() {
    this.players.forEach(p => this.playerPhaseScores.set(p.id, 0));

    this.groupRows.forEach(group => {
      group.teams.forEach(teamRow => {
        if (!teamRow.edited && teamRow.realPosition === 0) return;
        teamRow.playerPredictions.forEach(pp => {
          const current = this.playerPhaseScores.get(pp.player.id) ?? 0;
          this.playerPhaseScores.set(pp.player.id, current + pp.points);
        });
      });
    });

  }

  private persistScores() {
    this.dataService.setGroupPoints(this.playerPhaseScores);
  }

  getGroupScore(playerId: number): number {
    return this.playerPhaseScores.get(playerId) ?? 0;
  }

  getGroupPointsForPlayer(playerId: number, groupRow: GroupRow): number {
    return groupRow.teams.reduce((total, teamRow) => {
      const pp = teamRow.playerPredictions.find(p => p.player.id === playerId);
      return total + (pp?.points ?? 0);
    }, 0);
  }

  private checkFullGroupMatch(groupRow: GroupRow) {
    this.players.forEach(player => {
      // Verificar si todos los equipos del grupo tienen posición real ingresada
      const allEdited = groupRow.teams.every(t => t.realPosition > 0);
      if (!allEdited) return;

      // Verificar si el jugador acertó todas las posiciones del grupo
      const fullMatch = groupRow.teams.every(teamRow => {
        const pp = teamRow.playerPredictions.find(p => p.player.id === player.id);
        return pp?.correct;
      });

      // Marcar fullMatch en cada predicción del grupo para ese jugador
      groupRow.teams.forEach(teamRow => {
        const pp = teamRow.playerPredictions.find(p => p.player.id === player.id);
        if (pp) pp.fullGroupMatch = fullMatch;
      });
    });
  }

  private saveEditsToStorage() {
    if (!this.phase || typeof sessionStorage === 'undefined') return;
    const edits = this.groupRows.flatMap(g =>
      g.teams
        .filter(t => t.edited)
        .map(t => ({ id: t.team.id, pos: t.realPosition }))
    );
    sessionStorage.setItem(`group_edits_phase_${this.phase.id}`, JSON.stringify(edits));
  }

  private restoreEditsFromStorage() {
    if (!this.phase || typeof sessionStorage === 'undefined') return;
    const raw = sessionStorage.getItem(`group_edits_phase_${this.phase.id}`);
    if (!raw) return;
    const edits: { id: number, pos: number }[] = JSON.parse(raw);
    edits.forEach(edit => {
      this.groupRows.forEach(groupRow => {
        const teamRow = groupRow.teams.find(t => t.team.id === edit.id);
        if (!teamRow) return;
        teamRow.realPosition = edit.pos;
        teamRow.edited = true;
        teamRow.playerPredictions = teamRow.playerPredictions.map(pp => {
          const correct = pp.predictedPosition === teamRow.realPosition;
          return { ...pp, correct, points: correct ? (this.phase?.classified_points ?? 0) : 0 };
        });
        this.checkFullGroupMatch(groupRow);
      });
    });
    this.recalculateAllScores();
  }

  hasFullGroupMatch(playerId: number, groupRow: GroupRow): boolean {
    return groupRow.teams.some(teamRow => {
      const pp = teamRow.playerPredictions.find(p => p.player.id === playerId);
      return pp?.fullGroupMatch;
    });
  }

  get visiblePlayers(): Player[] {
  const id = this.dataService.selectedPlayerId();
  return id === 0 ? this.players : this.players.filter(p => p.id === id);
}

visiblePredictions(predictions: any[]): any[] {
  const id = this.dataService.selectedPlayerId();
  return id === 0 ? predictions : predictions.filter(pp => pp.player.id === id);
}

}