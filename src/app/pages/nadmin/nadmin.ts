import { Component, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { NDataService } from '../../services/ndata.service';

@Component({
  selector: 'app-nadmin',
  standalone: true,
  templateUrl: './nadmin.html',
  styleUrls: ['./nadmin.css'],
})
export class NAdmin {
  private dataService = inject(NDataService);

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  exportNdata(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const base = this.dataService.worldCupData();
    if (!base) return;

    // 1. Edits de partidos por fase
    const gameEdits = new Map<number, { g1: number; g2: number }>();
    for (let phase = 1; phase <= 6; phase++) {
      const raw = sessionStorage.getItem(`game_edits_phase_${phase}`);
      if (!raw) continue;
      const edits: { id: number; g1: number; g2: number }[] = JSON.parse(raw);
      edits.forEach(e => gameEdits.set(e.id, { g1: e.g1, g2: e.g2 }));
    }

    // 2. Edits de posiciones de equipos en grupos por fase
    const teamPositionEdits = new Map<number, number>();
    for (let phase = 1; phase <= 6; phase++) {
      const raw = sessionStorage.getItem(`group_edits_phase_${phase}`);
      if (!raw) continue;
      const edits: { id: number; pos: number }[] = JSON.parse(raw);
      edits.forEach(e => teamPositionEdits.set(e.id, e.pos));
    }

    // 3. Ranking de participantes desde positions_snapshot
    const playerRankMap = new Map<number, number>();
    const snapshotRaw = sessionStorage.getItem('positions_snapshot');
    if (snapshotRaw) {
      const snapshot = JSON.parse(snapshotRaw);
      const ranks: { id: number; rank: number }[] = Array.isArray(snapshot)
        ? snapshot
        : (snapshot.ranks ?? []);
      ranks.forEach(r => playerRankMap.set(r.id, r.rank));
    }

    // 4. Puntajes totales calculados
    const totalScores = this.dataService.playerTotalScores();

    // --- Construir el ndata exportado ---

    const games = base.games.map((g: any) => {
      const edit = gameEdits.get(g.id);
      if (!edit) return g;
      return {
        ...g,
        goals_team1: edit.g1,
        goals_team2: edit.g2,
        end_game: true,
      };
    });

    const teams = base.teams.map((t: any) => {
      const pos = teamPositionEdits.get(t.id);
      if (pos === undefined) return t;
      return { ...t, position: pos };
    });

    const players = base.players.map((p: any) => {
      const total = totalScores.get(p.id);
      const position = playerRankMap.get(p.id);
      return {
        ...p,
        ...(total !== undefined ? { total_score: total } : {}),
        ...(position !== undefined ? { position } : {}),
      };
    });

    const exportData = {
      ...base,
      games,
      teams,
      players,
    };

    // 5. Descargar como archivo JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ndata.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
