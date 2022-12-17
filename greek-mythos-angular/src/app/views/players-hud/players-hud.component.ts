import { Component, Input, OnInit } from '@angular/core';
import { Player, Players } from 'src/app/models/board';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-players-hud',
  templateUrl: './players-hud.component.html',
  styleUrls: ['./players-hud.component.scss']
})
export class PlayersHudComponent implements OnInit {

  @Input() players: Players;
  @Input() user: User;

  @Input() minPoints: number;

  expanded = false;

  constructor() { }

  ngOnInit(): void {
  }
  
  trackById(player) {
    return player.key;
  }

}
