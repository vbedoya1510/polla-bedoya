import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { Player } from '../../shared/models/player.model';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './players.html',
  styleUrl: './players.css',
})
export class Players {

private dataService = inject(DataService);

  // 1. Conexión al tanque principal (Servicio)
  data = this.dataService.worldCupData;
  currentPage = signal(1);
  itemsPerPage: number = 10;

  players = computed(() => {
    const rawData = this.dataService.worldCupData();
    if (!rawData) return [];

    return rawData.players.map((p: Player) => {
      const currentScore = p.total_score;
      const prevScore = p.previous_score || 0;

      return {
        ...p,
        trend: currentScore > prevScore ? 'up' : 
               currentScore < prevScore ? 'down' : 'equal',
        diff: currentScore - prevScore
      };
    }).sort((a: { total_score: number; }, b: { total_score: number; }) => b.total_score - a.total_score); // Ordenados por ranking
  });

  totalPages = computed(() => {
  return Math.ceil(this.players().length / this.itemsPerPage);
});

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

paginatedPlayers = computed(() => {
  const start = (this.currentPage() - 1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;
  
  // Obtenemos el ranking ya ordenado y cortamos la tajada (slice)
  return this.players().map((player: Player) => ({
    ...player,
    trend: this.scoreChange(player) // Calculamos la tendencia una sola vez
  })).slice(start, end);
});

pages = computed(() => {
  const length = this.totalPages();
  return Array.from({ length }, (_, i) => i + 1);
});

scoreChange(player: Player): 'up' | 'down' | 'same' {
  if (player.previous_score === undefined) return 'same';
  if (player.total_score > player.previous_score) return 'up';
  if (player.total_score < player.previous_score) return 'down';
  return 'same';
}

  simularAcierto(playerId: number) {
    // Llamamos al método del servicio para sumar, por ejemplo, 5 puntos
    this.dataService.updatePlayerScore(playerId, 5);
  }

  simularDesacierto(playerId: number) {
    // Llamamos al método del servicio para sumar, por ejemplo, 5 puntos
    this.dataService.updatePlayerScore(playerId, -5);
  }
}
