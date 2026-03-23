import { Component, Input, OnChanges, OnDestroy, effect, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../shared/models/player.model';
import { NDataService } from '../../services/ndata.service';

interface RankedPlayer {
  player: Player;
  currentRank: number;
  trend: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'app-npositions-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './npositions-table.html',
  styleUrls: ['./npositions-table.css']
})
export class NpositionsTable implements OnChanges, OnDestroy {
  @Input() players: Player[] = [];
  rankedPlayers: RankedPlayer[] = [];

  private dataService = inject(NDataService);
  private cdr = inject(ChangeDetectorRef);
  private previousRanks = new Map<number, number>();
  private readonly SNAPSHOT_KEY = 'positions_snapshot';

  constructor() {
    // Carga snapshot guardado en visita anterior
    const saved = localStorage.getItem(this.SNAPSHOT_KEY);
    if (saved) {
      const arr: { id: number; rank: number }[] = JSON.parse(saved);
      arr.forEach(item => this.previousRanks.set(item.id, item.rank));
    }

    effect(() => {
      const scores = this.dataService.playerTotalScores();
      this.buildRanking(scores);
      setTimeout(() => this.cdr.detectChanges());
    });
  }

  ngOnChanges(): void {
    const scores = this.dataService.playerTotalScores();
    this.buildRanking(scores);
  }

  ngOnDestroy(): void {
    // Guarda ranking actual al salir
    const snapshot = this.rankedPlayers.map(item => ({
      id: item.player.id,
      rank: item.currentRank
    }));
    localStorage.setItem(this.SNAPSHOT_KEY, JSON.stringify(snapshot));
  }

  private buildRanking(scores: Map<number, number>): void {
    if (!this.players.length) return;

    const withScores = this.players.map(p => ({
      ...p,
      total_score: scores.get(p.id) ?? p.total_score
    }));

    const sorted = [...withScores].sort((a, b) => b.total_score - a.total_score);

    this.rankedPlayers = sorted.map((player, index) => {
      const currentRank = index + 1;
      const previousRank = this.previousRanks.get(player.id);

      let trend: 'up' | 'down' | 'neutral' = 'neutral';
      if (previousRank !== undefined) {
        if (currentRank < previousRank) trend = 'up';
        else if (currentRank > previousRank) trend = 'down';
      }

      return { player, currentRank, trend };
    });

  }
}