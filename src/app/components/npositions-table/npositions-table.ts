import { Component, Input, OnChanges, effect, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Player } from '../../shared/models/player.model';
import { NDataService } from '../../services/ndata.service';

interface RankedPlayer {
  player: Player;
  totalScore: number;
  currentRank: number;
  trend: 'up' | 'down' | 'neutral';
}

interface PositionSnapshot {
  ranks: { id: number; rank: number }[];
  trends: { id: number; trend: 'up' | 'down' | 'neutral' }[];
}

@Component({
  selector: 'app-npositions-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './npositions-table.html',
  styleUrls: ['./npositions-table.css']
})
export class NpositionsTable implements OnChanges {
  @Input() players: Player[] = [];
  rankedPlayers: RankedPlayer[] = [];

  private dataService = inject(NDataService);
  private cdr = inject(ChangeDetectorRef);
  private savedRanks = new Map<number, number>();
  private savedTrends = new Map<number, 'up' | 'down' | 'neutral'>();
  private readonly SNAPSHOT_KEY = 'positions_snapshot';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = sessionStorage.getItem(this.SNAPSHOT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Compatibilidad con formato anterior (array plano) y formato nuevo (objeto con ranks/trends)
        const snapshot: PositionSnapshot = Array.isArray(parsed)
          ? { ranks: parsed, trends: [] }
          : parsed;
        (snapshot.ranks ?? []).forEach(item => this.savedRanks.set(item.id, item.rank));
        (snapshot.trends ?? []).forEach(item => this.savedTrends.set(item.id, item.trend));
      }
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

  private buildRanking(scores: Map<number, number>): void {
    if (!this.players.length) return;

    const withScores = this.players.map(p => ({
      player: p,
      totalScore: scores.get(p.id) ?? p.total_score
    }));

    const sorted = [...withScores].sort((a, b) => b.totalScore - a.totalScore);

    // Verificar si hubo cambio real en los rankings
    const ranksChanged = sorted.some(({ player }, index) => {
      const currentRank = index + 1;
      const savedRank = this.savedRanks.get(player.id);
      return savedRank !== undefined && savedRank !== currentRank;
    });

    this.rankedPlayers = sorted.map(({ player, totalScore }, index) => {
      const currentRank = index + 1;

      let trend: 'up' | 'down' | 'neutral';

      if (ranksChanged) {
        // Hubo cambio: recalcular tendencias comparando contra snapshot anterior
        const previousRank = this.savedRanks.get(player.id)
          ?? (player.position > 0 ? player.position : undefined);
        trend = 'neutral';
        if (previousRank !== undefined) {
          if (currentRank < previousRank) trend = 'up';
          else if (currentRank > previousRank) trend = 'down';
        }
      } else if (this.savedTrends.size > 0) {
        // Sin cambio: mantener tendencias guardadas
        trend = this.savedTrends.get(player.id) ?? 'neutral';
      } else {
        // Primera vez (sin snapshot): usar position de ndata.json
        const basePosition = player.position > 0 ? player.position : undefined;
        trend = 'neutral';
        if (basePosition !== undefined) {
          if (currentRank < basePosition) trend = 'up';
          else if (currentRank > basePosition) trend = 'down';
        }
      }

      return { player, totalScore, currentRank, trend };
    });

    // Solo guardar snapshot cuando hay cambio real o es la primera vez
    if (ranksChanged || this.savedRanks.size === 0) {
      this.saveSnapshot();
    }
  }

  private saveSnapshot(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const snapshot: PositionSnapshot = {
      ranks: this.rankedPlayers.map(item => ({ id: item.player.id, rank: item.currentRank })),
      trends: this.rankedPlayers.map(item => ({ id: item.player.id, trend: item.trend })),
    };
    sessionStorage.setItem(this.SNAPSHOT_KEY, JSON.stringify(snapshot));
    // Actualizar el estado en memoria también
    this.savedRanks.clear();
    this.savedTrends.clear();
    this.rankedPlayers.forEach(item => {
      this.savedRanks.set(item.player.id, item.currentRank);
      this.savedTrends.set(item.player.id, item.trend);
    });
  }

  isSelected(playerId: number): boolean {
    const id = this.dataService.selectedPlayerId();
    return id !== 0 && id === playerId;
  }
}