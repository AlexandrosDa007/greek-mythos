import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { objectKVs } from 'src/app/helpers/object-keys-values';
import { Game } from 'src/app/models/game';
import { AuthService } from 'src/app/services/auth.service';
// Maybe find a way to import better :P
declare const rollADie: any;
@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss'],
})
export class DiceComponent implements OnInit {

  constructor(
    private authService: AuthService,
  ) { }
  @Input() diceResult: number;
  playerName: string;

  @Input() game: Game;

  isMyDice: boolean;

  @Output() changeSomething = new EventEmitter();

  @Input() noSound: boolean;
  @Input() isSinglePlayer = false;

  async ngOnInit(): Promise<void> {
    const soundVolume = localStorage.getItem('effects') ? JSON.parse(localStorage.getItem('effects')) : 0.5;
    console.log(this.diceResult);
    this.isMyDice = this.game.players[this.authService.appUser.uid].turnIndex === this.game.turnIndex;
    this.playerName = objectKVs(this.game.players).find(player => this.game.players[player.key].turnIndex === this.game.turnIndex).value.displayName;
    rollADie({
      element: document.getElementById('mpla'), numberOfDice: 1, callback: () => {}, noSound: this.noSound, delay: 3000, values: [this.diceResult], soundVolume
    });


    setTimeout(() => {
      this.changeSomething.emit();
    }, 3000);


  }

}
