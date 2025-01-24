import { Component, Input, OnInit } from '@angular/core';
import { Player, Players } from '@app/models/board';
import { User } from '@app/models/user';

@Component({
  selector: 'app-players-hud',
  templateUrl: './players-hud.component.html',
  styleUrls: ['./players-hud.component.scss']
})
export class PlayersHudComponent implements OnInit {

  @Input() players?: Players;
  @Input({required: true}) user!: User;

  @Input() minPoints = 0;

  expanded = false;

  constructor() { }

  ngOnInit(): void {
  }
  
  trackById(index: number, player: Player) {
    return player.uid;
  }

}
