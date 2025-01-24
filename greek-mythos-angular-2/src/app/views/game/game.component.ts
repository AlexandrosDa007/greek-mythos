import { Component, OnDestroy, OnInit, TrackByFunction } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from '@app/services/game.service';
import { getSpiralFormOfArray } from '@app/helpers/matrix';
import { Board, Cell, Player, Row } from '@app/models/board';
import { objectKeys, objectKVs } from '@app/helpers/object-keys-values';
import { AuthService } from '@app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Game, GameEvent, Question, QuestionState } from '../../models/game';
import { TimerService } from '@app/services/timer.service';
import { QuestionService } from '@app/services/question.service';
import { EVENTS_MAP_BIG, EVENTS_MAP_SMALL, QUESTIONS_MAP_SMALL, QUESTIONS_MAP_BIG, HELPS } from '@env/environment';
import { getRemovedPlayersNames } from '@app/helpers/get-removed-players-names';
import { AudioService } from '@app/services/audio.service';
import { Settings } from '@app/models/settings';
import { ModalsService } from '@app/services/modals.service';
import { User } from '@app/models/user';
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  showSettings = false;
  settings: Settings;
  moveInterval = 500;

  gameEventsMap: Record<number, true> = {};
  gameQuestionsMap: Record<number, true> = {};

  user: any;
  board!: Board;
  isBoardDone = false;

  gameSubcription!: Subscription;
  canRoll = false;

  activeQuestion: Question | null = null;
  isMyQuestion = false;

  questionState!: QuestionState;

  activeGameEvent: GameEvent | null = null;
  isMyGameEvent!: boolean;

  canDoAction!: boolean;

  gameOverPlayer!: string;

  timerSubscription!: Subscription;
  timer: number | null = null;
  fiveSecondTimer = 100;

  lastUpdateSubscription?: Subscription;
  fiveSecondSubscription?: Subscription;
  afkPlayerSubscription?: Subscription;
  questionSubscription?: Subscription;

  questionTimer: any;
  // gameEventTimer: any;
  lastOnlineInterval: any;

  canShowDiceAnimation!: boolean;
  diceResult!: number;
  playerTurnName = '';


  constructor(
    private gameService: GameService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private timerService: TimerService,
    private router: Router,
    private questionService: QuestionService,
    private audioService: AudioService,
    private modalsService: ModalsService,
  ) {
    this.settings = this.audioService.getAudioSettings();
  }

  ngOnDestroy(): void {
    this.gameSubcription?.unsubscribe();
    this.lastUpdateSubscription?.unsubscribe();
    this.fiveSecondSubscription?.unsubscribe();
    this.afkPlayerSubscription?.unsubscribe();
    // this.timerSubscription?.unsubscribe();
    this.questionSubscription?.unsubscribe();
    this.gameService.inGame$.next(false);
    this.audioService.stopBackgroundMusic();
  }

  async ngOnInit(): Promise<void> {

    this.user = this.authService.appUser!.uid;
    if (this.isBoardDone && this.board.game) {
      // send
    }
    this.setUpBoard();
    this.audioService.playBackgroundMusic();
    this.gameSubcription = this.route.paramMap.pipe(
      switchMap(params => {
        if (!params.get('gameId')) {
          throw new Error('No game id');
        }
        return this.gameService.getGame(params.get('gameId')!);
      })
    ).subscribe(async game => {
      if (game?.id === 'no_game') {
        await this.modalsService.openAlert('Το παιχνίδι τελείωσε λόγω αδράνειας!');
        this.router.navigate(['home']);
        return;
      }
      this.gameService.inGame$.next(true);
      if (game && game.isSmall !== this.gameService.isSmall) {
        this.gameService.isSmall = game.isSmall;
        console.log('fixing board');
        this.setUpBoard();
      }
      this.lastUpdateSubscription?.unsubscribe();
      this.afkPlayerSubscription?.unsubscribe();
      this.fiveSecondSubscription?.unsubscribe();
      // this.timerSubscription?.unsubscribe();
      this.questionSubscription?.unsubscribe();
      clearTimeout(this.questionTimer);
      // clearTimeout(this.gameEventTimer);
      if (game) {
        if (!game.players[this.user.uid]) {
          console.log('You have been removed from the game!');
          this.router.navigate(['home']);
          return;
        }
      }
      if (this.isBoardDone && game) {

        await this.handleMovement(game);
      }
      if (game?.gameOver) {
        if (typeof game.gameOver === 'boolean' && game.gameOver === true) {
          //something went wrong and game is over
          await this.modalsService.openAlert('Το παιχνίδι τελείωσε λόγω αδράνειας!');
          this.router.navigate(['home']);
          return;
        }
        // finish game...
        this.gameOverPlayer = game.players[objectKeys(game.gameOver)[0]].displayName;
        this.activeGameEvent = null;
        this.activeQuestion = null;

      }
      console.log(game);
      if (!game && this.isBoardDone) {
        this.router.navigate(['../']);
        return;
      }

      if (game?.question) {
        this.handleQuestion(game);
      } else {
        this.activeQuestion = null;
      }

      this.board.game = game ?? undefined;
      this.isBoardDone = true;

      if (game?.gameEvent) {
        this.handleGameEvent(game);
      } else {
        this.activeGameEvent = null;
        this.moveInterval = 500;
      }
      this.handleTurn(game!);

      console.log(this.canDoAction);
      this.playerTurnName = objectKVs(game?.players).find((pl) => {
        if (pl.value.turnIndex === game?.turnIndex) {
          return pl;
        }
        return undefined;
      })?.value?.displayName ?? '';
    });
  }
  /**@deprecated */
  checkForGameActivity(): void {
    const turnIndex = this.board.game!.players[this.user.uid].turnIndex!;
    this.lastUpdateSubscription = this.timerService.getLastUpdateGame(turnIndex)
      .subscribe(async v => {
        if (v === -999) {
          console.log('Game timeout calling D.A.D...');
          this.lastUpdateSubscription?.unsubscribe();
          // something went wrong call a function (dad)
          const res = await this.gameService.cleanUpGame(this.board.game!.id);
          if (res === 'ok') {
          }
          console.log(res);
          this.router.navigate(['/home']);
        }
      });
  }

  handleGameEvent(game: Game): void {
    const gameEvent = game.gameEvent!;
    console.log('There is a game event', game.gameEvent);
    this.isMyGameEvent = gameEvent.playerUid === this.user.uid;
    this.activeGameEvent = gameEvent;
    this.moveInterval = gameEvent.id === 'gameEvent_CUSTOM' ? 100 : 500;
    this.fiveSecondSubscription = this.timerService.getFiveSecondTimer().subscribe(v => {
      const rel = ((100 * v) / 50);
      this.fiveSecondTimer = rel;
      if (v === -999) {
        if (this.isMyGameEvent) {
          this.answerGameEvent();
        }
        this.fiveSecondSubscription?.unsubscribe();
        this.fiveSecondTimer = 100;
        this.activeGameEvent = null;
      }
    });
  }

  async handleDice(game: Game): Promise<void> {
    const isOldQuestionFinished = (['failedM','failedP','finishedM','finishedP','skipped'] as QuestionState[]).includes(this.board.game!.question!.state);
    if ((this.board.game?.question && game.question && !isOldQuestionFinished) || (this.board.game?.gameEvent && game.gameEvent) || !game.diceResult) {
      console.log('is same player skip dice animation');
      return;
    }
    // wait for dice animation
    this.diceResult = game.diceResult;
    this.playerTurnName = objectKVs(game.players).find((pl) => {
      if (pl.value.turnIndex === game.turnIndex) {
        return pl;
      }
      return undefined;
    })?.value?.displayName ?? '';
    if (game.gameOver && typeof game.gameOver !== 'boolean') {
      this.gameOverPlayer = game.players[objectKeys(game.gameOver)[0]].displayName;
    }
    console.log(this.playerTurnName);

    this.canShowDiceAnimation = true;
    await new Promise(res => setTimeout(res, 3000));
  }

  async handleMovement(game: Game): Promise<void> {
    if (objectKeys(this.board.game!.players).length !== objectKeys(game.players).length) {
      const removedPlayers = getRemovedPlayersNames(this.board.game!, game);
      console.log('removed players', removedPlayers);

      let message = `Οι χρήστες [`;
      removedPlayers.forEach((playerName, index) => {
        const newMsg = ` ${playerName} ${index < removedPlayers.length - 1 ? 'και ' : ''}`;
        message = message + newMsg;
      });
      message = message + '] - έφυγαν απο το παιχνίδι';
      this.modalsService.openYellowSnack(message);
      return;
    }
    for (const player of objectKVs(this.board.game!.players)) {

      const oldPosition = player.value.position!;
      const newPosition = game.players[player.key].position!;

      if (oldPosition !== newPosition) {
        await this.handleDice(game);
        // const result = ((newPosition - oldPosition) > 0) ? (newPosition - oldPosition) : (oldPosition - newPosition);
        const result = newPosition - oldPosition;
        this.canRoll = false;
        // Started moving
        if (result > 0) {
          for (let i = 0; i < result; i++) {
            this.board.game!.players[player.key].position!++;
            this.audioService.playMoveSound();
            await new Promise(res => setTimeout(res, this.moveInterval));
          }
        } else {
          const positiveResult = result * -1;
          for (let i = 0; i < positiveResult; i++) {
            this.board.game!.players[player.key].position!--;
            this.audioService.playMoveSound();
            await new Promise(res => setTimeout(res, this.moveInterval));
          }
        }

        // Finished moving
        this.canRoll = true;
      }

    }
  }

  handleTurn(game: Game): void {
    // this.timerSubscription?.unsubscribe();
    this.afkPlayerSubscription?.unsubscribe();
    const isMyTurn = game.players[this.user.uid].turnIndex === game.turnIndex;
    if (isMyTurn && !game.gameEvent && !this.activeGameEvent && !this.activeQuestion) {
      // my turn
      this.canRoll = true;

      // start timer
      // this.timerSubscription = this.timerService.getTurnTimer().subscribe(async v => {
      //   this.timer = v;
      //   if (v === -999) {
      //     console.log('Teleiwse o gyros soy');
      //     this.timerSubscription.unsubscribe();
      //     this.timer = null;
      //   }
      // });
    } else {
      this.canRoll = false;
    }
    // if (this.activeGameEvent && !game.gameEvent) {
    //   // if there was a game event why is this needed
    //   this.canRoll = true;
    // }
    this.canDoAction = isMyTurn;
    if (!isMyTurn) {
      // start timer for afk and question and event
      this.afkPlayerSubscription = this.timerService.getAfkPlayerTimer(game.players[this.user.uid].turnIndex!)
        .subscribe(async v => {
          if (v === -999) {
            console.log('Maybe a player is afk calling function...');
            // call function
            this.afkPlayerSubscription?.unsubscribe();
            await this.gameService.checkForAfkPlayers(game.id);
          }
        });
    }
  }


  handleQuestion(game: Game): void {
    this.timer = null;
    this.activeQuestion = game.question!.question;
    this.isMyQuestion = game.question!.playerUid === this.user.uid;
    const state = game.question!.state;
    this.questionState = state;
    if (['skipped', 'failedM', 'failedP', 'finishedM', 'finishedP'].includes(state)) {
      const isCustomGameEvent = game.gameEvent?.id === 'gameEvent_CUSTOM';
      const isGameOver = !!game.gameOver;
      const closeQuestionAfter = (isCustomGameEvent || isGameOver) ? 0 : 3000;
      this.questionTimer = setTimeout(() => {
        this.activeQuestion = null;
        this.handleTurn(game);
      }, closeQuestionAfter);
    }
    // else if (this.isMyQuestion && state === 'waitingAns') {
    //   this.questionSubscription = this.timerService.getQuestionTimer().subscribe(async v => {
    //     if (v === -999) {
    //       // force fail the question
    //       this.timer = null;
    //       this.questionSubscription?.unsubscribe();
    //       await this.answerQuestion('');
    //     }
    //     this.timer = v;
    //   });
    // }

  }

  async rollDice(): Promise<void> {
    this.canDoAction = false;
    console.log('rolling dice');
    const result = await this.gameService.rollDice(this.user.uid, this.board.game!);

    console.log('You did a ', result);
    // this.timerSubscription.unsubscribe();
    this.timer = null;

  }

  setUpBoard(): void {
    this.gameQuestionsMap = {};
    this.gameEventsMap = {};
    this.board = {
      rows: []
    };
    console.log(this.gameService.isSmall);

    const rows = this.gameService.isSmall ? 7 : 10;
    const spiralArray = getSpiralFormOfArray(rows);

    for (let i = 0; i < rows; i++) {
      this.board.rows[i] = {
        cells: []
      }
      for (let j = 0; j < spiralArray[i].length; j++) {
        this.board.rows[i].cells[j] = {
          index: spiralArray[i][j],
        };
      }
    }
    if (this.gameService.isSmall) {
      QUESTIONS_MAP_SMALL.forEach(question => this.gameQuestionsMap[question] = true);
      EVENTS_MAP_SMALL.forEach(gameEvent => this.gameEventsMap[gameEvent] = true);
      console.log('%c hahaha', 'padding:5px;color:red;');
    } else {
      QUESTIONS_MAP_BIG.forEach(question => this.gameQuestionsMap[question] = true);
      EVENTS_MAP_BIG.forEach(gameEvent => this.gameEventsMap[gameEvent] = true);
      console.log('%c hahaha', 'padding:5px;color:red;');

    }
  }

  trackRow(index: number, row: Row) {
    return row.cells.length;
  }

  trackCell(index: number, cell: Cell) {
    return cell.index;
  }

  trackByUid(index: number, player: Player) {
    return player.uid;
  }

  async answerQuestion(answer: string): Promise<void> {
    this.questionSubscription?.unsubscribe();
    this.canDoAction = false;
    await this.questionService.answerQuestion(this.board.game!.id, answer);
  }

  async answerGameEvent(): Promise<void> {
    console.log('sending this', this.board.game!.id);
    this.canDoAction = false;
    await this.gameService.answerGameEvent(
      this.board.game!.id,
      this.activeGameEvent!,
      this.board.game!.players[this.authService.appUser!.uid].position!,
      this.board.game!.players[this.authService.appUser!.uid].points!,
      this.board.game!.nextTurn!
    );
  }

  quitGame(): void {
    this.router.navigate(['../']);
  }

  async getHelp(ans: string): Promise<void> {
    this.canDoAction = false;
    await this.gameService.getHelp(ans, this.board.game!.id);
  }

  async getReward(rewardType: 'points' | 'move'): Promise<void> {
    this.canDoAction = false;
    const res = await this.gameService.getReward(this.board.game!.id, rewardType);
    console.log(res);
  }

  async qTurnFinished(): Promise<void> {
    console.log('ssljflsj');

    await this.answerQuestion('');
  }

  turnVolume(type: 'music' | 'effects', volume: number): void {
    console.log(volume);
    const newVolume = volume / 100;
    localStorage.setItem(type, `${newVolume}`);

    // recalculate settings
    this.settings[type] = newVolume;
    this.audioService.stopBackgroundMusic();
    this.audioService.playBackgroundMusic();
  }

  setMute(type: 'musicMute' | 'effectsMute', checked: boolean): void {
    localStorage.setItem(type, JSON.stringify(checked));
    this.settings[type] = checked;
    this.audioService.stopBackgroundMusic();
    this.audioService.playBackgroundMusic();
  }

}
