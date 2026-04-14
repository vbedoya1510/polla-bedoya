// npositions.ts
import { ChangeDetectorRef, Component, effect, inject, ViewChild, OnDestroy } from '@angular/core';
import { NDataService } from '../../services/ndata.service';
import { NpositionsTable } from '../../components/npositions-table/npositions-table';
import { Player } from '../../shared/models/player.model';

@Component({
  selector: 'app-npositions',
  imports: [NpositionsTable],
  templateUrl: './npositions.html',
  styleUrl: './npositions.css',
})
export class Npositions {
  private dataService = inject(NDataService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('positionsTable') positionsTable!: NpositionsTable;

  players: Player[] = [];

  constructor() {
    effect(() => {
      const data = this.dataService.worldCupData();
      const scores = this.dataService.playerTotalScores();
      if (!data) return;

      this.dataService.initBaseScores();

      this.players = data.players.map((p: any) => {
        const player = new Player(p.id, p.name, p.phone, p.email, p.pay, p.total_score, null as any, p.position);
        player.total_score = scores.get(p.id) ?? p.total_score;
        return player;
      });

      this.cdr.detectChanges();
    });
  }


}