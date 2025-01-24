import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { objectKVs } from '@app/helpers/object-keys-values';
import { Game } from '@app/models/game';
import { AudioService } from '@app/services/audio.service';
import { AuthService } from '@app/services/auth.service';
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
    private audioService: AudioService,
  ) { }
  @Input() diceResult = 0;
  playerName = '';

  @Input({ required: true } ) game!: Game;

  isMyDice = false;

  @Output() changeSomething = new EventEmitter();

  @Input() noSound = false;
  @Input() isSinglePlayer = false;

  async ngOnInit(): Promise<void> {
    const soundVolume = this.audioService.getEffectsVolume();
    console.log(this.diceResult);
    this.isMyDice = this.game.players[this.authService.appUser!.uid].turnIndex === this.game.turnIndex;
    const players = this.game.players;
    this.playerName = objectKVs(players).find(player => players[player.key]!.turnIndex === this.game.turnIndex)!.value.displayName;
    rollADie({
      element: document.getElementById('mpla'), numberOfDice: 1, callback: () => {}, noSound: this.noSound, delay: 3000, values: [this.diceResult], soundVolume
    });

    setTimeout(() => {
      this.changeSomething.emit();
    }, 3000);


  }

}
