import { CommonModule } from '@angular/common';
import { Component, inject, effect, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Player } from '../models/player.model';
import { NDataService } from '../../services/ndata.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isMenuOpen = false;
  isLogin: boolean = false;
  public authService = inject(AuthService);
  private router = inject(Router);
  private dataService = inject(NDataService);
  private cdr = inject(ChangeDetectorRef);
  players: Player[] = [];

  constructor() {
    effect(() => {
      const data = this.dataService.worldCupData();
      if (!data) return;
      this.players = [...data.players]
        .map((p: any) => new Player(p.id, p.name, p.phone, p.email, p.pay, p.total_score, p.position))
        .sort((a, b) => a.name.localeCompare(b.name));
      setTimeout(() => this.cdr.detectChanges());
    });
  }

  onPlayerSelect(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    this.dataService.setSelectedPlayer(id);
  }

  goTo(namePage: string) {
    this.router.navigate([`/${namePage}`]);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}