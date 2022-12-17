import { Location } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { getNumberFromZeroToX } from 'src/app/helpers/get-number-zero-to-x';
import { halveAnswers } from 'src/app/helpers/half-answers';
import { getSpiralFormOfArray } from 'src/app/helpers/matrix';
import { objectKeys, objectValues } from 'src/app/helpers/object-keys-values';
import { Board } from 'src/app/models/board';
import { Game, GameEvent, GameQuestion } from 'src/app/models/game';
import { Settings } from 'src/app/models/settings';
import { User } from 'src/app/models/user';
import { AudioService } from 'src/app/services/audio.service';
import { AuthService } from 'src/app/services/auth.service';
import { QuestionService } from 'src/app/services/question.service';
import { SinglePlayerService } from 'src/app/services/single-player.service';
import { TimerService } from 'src/app/services/timer.service';
import { EVENTS_MAP_BIG, EVENTS_MAP_SMALL, HELPS, QUESTIONS_MAP_BIG, QUESTIONS_MAP_SMALL } from 'src/environments/environment';

@Component({
  selector: 'app-single-player',
  templateUrl: './single-player.component.html',
  styleUrls: ['./single-player.component.scss']
})
export class SinglePlayerComponent implements OnInit, OnDestroy {

  started = false;

  showSettings = false;

  settings: Settings;

  board: Board;
  gameQuestionsMap: Record<number, true> = {};
  gameEventsMap: Record<number, true> = {};

  newGame = {
    isSmall: false,
    minPoints: 150,
    maxHelps: {
      help_50: 3,
      skip: 2,
    }
  }
  lastStep: number;

  game: Game;

  diffToStepsMap = {
    'easy': 1,
    'medium': 2,
    'hard': 3
  };

  moveInterval = 500;

  canShowDiceAnimation = false;
  diceResult: number;

  canRoll = false;
  canDoAction = false;
  user: User;

  fiveSecondTimer = 100;

  activeQuestion: GameQuestion;
  activeGameEvent: GameEvent;

  isMyQuestion: boolean;
  isMyGameEvent: boolean;

  turnPlayer: string;

  gameOverPlayer: string;

  destroy$ = new EventEmitter();

  constructor(
    private singlePlayerService: SinglePlayerService,
    private audioService: AudioService,
    private questionService: QuestionService,
    private authService: AuthService,
    private timerService: TimerService,
  ) { }

  ngOnInit(): void {
    this.user = this.authService.appUser;

    //load settings
    this.settings = {
      music: Number.parseFloat(localStorage.getItem('music')),
      effects: Number.parseFloat(localStorage.getItem('effects')),
      musicMute: JSON.parse(localStorage.getItem('musicMute')) === true,
      effectsMute: JSON.parse(localStorage.getItem('effectsMute')) === true,
    };
  }

  ngOnDestroy(): void {
    this.audioService.stopBackgroundMusic();
  }

  startGame(): void {
    // and stuff
    this.game = {
      isSmall: this.newGame.isSmall,
      minPoints: this.newGame.minPoints,
      maxHelps: this.newGame.maxHelps,
      createdAt: 0,
      id: '',
      players: this.singlePlayerService.getSinglePlayerPlayers(),
      turnIndex: 0,
      updatedAt: 0,
    };
    this.lastStep = this.game.isSmall ? 49 : 100;
    this.setUpBoard();

    this.canRoll = true;
    this.canDoAction = true;
    this.turnPlayer = this.user.displayName;
    this.started = true;
    this.audioService.playBackgroundMusic();
  }

  setUpBoard(): void {
    this.gameQuestionsMap = {};
    this.gameEventsMap = {};
    this.board = {
      rows: [],
      game: this.game,
    };

    const rows = this.game.isSmall ? 7 : 10;
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
    if (this.game.isSmall) {
      QUESTIONS_MAP_SMALL.forEach(question => this.gameQuestionsMap[question] = true);
      EVENTS_MAP_SMALL.forEach(gameEvent => this.gameEventsMap[gameEvent] = true);
    } else {
      QUESTIONS_MAP_BIG.forEach(question => this.gameQuestionsMap[question] = true);
      EVENTS_MAP_BIG.forEach(gameEvent => this.gameEventsMap[gameEvent] = true);
    }
  }

  trackById(item) {
    return item.uid;
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

  async rollDice(uid: string): Promise<void> {
    this.turnPlayer = objectValues(this.board.game.players).find(player => player.turnIndex === this.board.game.turnIndex)?.displayName;
    // roll dicec
    const isBot = uid === 'bot';
    this.canRoll = false;
    const newDiceRoll = getNumberFromZeroToX(6) + 1;

    // show dice animation
    this.diceResult = newDiceRoll;
    this.canShowDiceAnimation = true;
    await new Promise(res => setTimeout(res, 3000));
    this.canShowDiceAnimation = false;

    let mode: 'question' | 'event' | 'gameOver' | 'move' = 'move';
    // is new position event or question
    if (this.gameQuestionsMap[this.board.game.players[uid].position + newDiceRoll]) {
      // its a question
      mode = 'question';
    } else if (this.gameEventsMap[this.game.players[uid].position + newDiceRoll]) {
      // its an event
      mode = 'event';
    } else if (this.board.game.players[uid].position + newDiceRoll >= this.lastStep) {
      // game over or not enought points
      mode = 'gameOver';
    }
    // otherwise just move
    this.board.game.players[uid].oldPosition = this.board.game.players[uid].position;
    this.changeTurn();
    await this.singlePlayerService.handleRoll(this.board.game, newDiceRoll, mode, uid);

    if (this.board.game.gameOver) {
      // game is over
      this.gameOverPlayer = this.board.game.players[objectKeys(this.board.game.gameOver)[0]].displayName;
      console.log(this.board.game);

      return;
    }

    this.activeGameEvent = this.board.game.gameEvent;
    this.activeQuestion = this.board.game.question;
    this.isMyQuestion = this.board.game.question?.playerUid === uid;
    this.isMyGameEvent = this.board.game.gameEvent?.playerUid === uid;

    if (!this.activeGameEvent && !this.activeQuestion) {
      // play with bot
      if (isBot) {
        this.canRoll = true;
      } else {
        await new Promise(res => setTimeout(res, 2000));
        this.rollDice('bot');
        return;
      }
    }

    if (this.activeGameEvent) {
      // start a timeout
      this.timerService.getFiveSecondTimer().pipe(takeUntil(this.destroy$))
        .subscribe(v => {
          if (v === -999) {
            this.removeFiveSecondTimer();
            this.destroy$.emit();
            return;
          }
          const rel = ((100 * v) / 50);
          this.fiveSecondTimer = rel;

        });
    }

    if (this.activeQuestion && uid === 'bot') {
      await this.answerQuestionForBot();
    }

    this.turnPlayer = objectValues(this.board.game.players).find(player => player.turnIndex === this.board.game.turnIndex)?.displayName;
  }

  async answerQuestionForBot(): Promise<void> {
    await this.singlePlayerService.waitFor(3000);
    // answer random
    const _randomNumber = getNumberFromZeroToX(4);
    this.activeQuestion.question.answer = this.activeQuestion.question.answers[_randomNumber];

    // get correct
    const correct = await this.questionService.getAnswerForQuestion(this.activeQuestion.question.id);
    this.activeQuestion.question.correct = correct;
    await this.singlePlayerService.waitFor(2000);
    const wasCorrect = this.activeQuestion.question.answer === correct;
    this.activeQuestion.state = wasCorrect ? 'answered' : 'failed';

    await this.singlePlayerService.waitFor(2000);


    if (wasCorrect) {
      const choices = ['move', 'points'];
      // randomize reward
      const _r1 = getNumberFromZeroToX(1);
      this.getReward(choices[_r1] as any);
    } else {
      const choices = ['go_back', 'remove_points'];
      const hasEnoughPoints = this.board.game.players[this.activeQuestion.playerUid].points >= this.activeQuestion.question.qPoints;

      if (hasEnoughPoints) {
        const _r1 = getNumberFromZeroToX(1);
        this.getReward(choices[_r1] as any);
      } else {
        this.getReward('go_back');
      }
    }
  }

  async getReward(rewardType: 'points' | 'move' | 'go_back' | 'remove_points'): Promise<void> {
    console.log(rewardType);
    const affectedUid = this.activeQuestion.playerUid;
    // set timeout to close
    switch (rewardType) {
      case 'move': {
        this.activeQuestion.state = 'finishedM';
        const stepsToMove = this.diffToStepsMap[this.activeQuestion.question.diff];
        for (let i = 0; i < stepsToMove; i++) {
          await this.singlePlayerService.waitFor(this.moveInterval);
          this.board.game.players[affectedUid].position++;
          this.audioService.playMoveSound();
        }
        break;
      }
      case 'go_back': {
        this.activeQuestion.state = 'failedM';
        for (let i = this.board.game.players[affectedUid].position; i > this.board.game.players[affectedUid].oldPosition; i--) {
          await new Promise(res => setTimeout(res, this.moveInterval));
          this.board.game.players[affectedUid].position -= 1;
          this.audioService.playMoveSound();
        }
        break;
      }
      case 'points': {
        this.activeQuestion.state = 'finishedP';
        this.board.game.players[affectedUid].points += this.activeQuestion.question.qPoints;
        break;
      }
      case 'remove_points': {
        this.activeQuestion.state = 'failedP';
        const oldPoints = this.board.game.players[affectedUid].points;
        if (oldPoints < this.activeQuestion.question.qPoints) {
          // not enough points
          console.error('Not enough points');
          break;
        } else {
          this.board.game.players[affectedUid].points -= this.activeQuestion.question.qPoints;
          break;
        }
      }
    }
    await this.singlePlayerService.waitFor(5000);
    this.activeQuestion = null;
    if (affectedUid !== 'bot') {
      await new Promise(res => setTimeout(res, 2000));
      this.rollDice('bot');
    } else {
      this.canRoll = true;
    }
  }

  async getHelp(help: 'help_50' | 'help_skip'): Promise<void> {
    console.log(help);

    switch (help) {
      case 'help_50': {
        this.board.game.players[this.user.uid].points -= HELPS.help_50;
        this.board.game.players[this.user.uid].helpUsed.help_50++;
        const newAnswers = halveAnswers(this.activeQuestion.question);
        this.activeQuestion.question.answers = newAnswers;
        break;
      }
      case 'help_skip': {
        this.board.game.players[this.user.uid].points -= HELPS.skip;
        this.board.game.players[this.user.uid].helpUsed.skip++;
        this.activeQuestion.state = 'skipped';
        await this.singlePlayerService.waitFor(5000);
        this.activeQuestion = null;
        this.rollDice('bot');
        break;
      }
    }
  }

  async answerQuestion(ans: string): Promise<void> {
    const correct = await this.questionService.getAnswerForQuestion(this.activeQuestion.question.id);
    this.activeQuestion.question.answer = ans;
    this.activeQuestion.question.correct = correct;
    if (ans === this.activeQuestion.question.correct) {
      this.activeQuestion.state = 'answered';
    } else {
      this.activeQuestion.state = 'failed';
    }
  }

  async qTurnFinished(): Promise<void> {
    await this.answerQuestion('');
  }

  quitGame(): void {
    // maybe reset
    location.reload();
  }

  async removeFiveSecondTimer(): Promise<void> {
    const uidAffected = this.activeGameEvent.playerUid;
    this.fiveSecondTimer = 100;
    this.activeGameEvent = null;
    this.isMyGameEvent = null;
    const gameEvent = this.board.game.gameEvent;


    const _newMoveInterval = gameEvent.id === 'gameEvent_CUSTOM' ? 100 : this.moveInterval;

    // do event action
    if (gameEvent.points) {
      this.board.game.players[uidAffected].points += (this.board.game.players[uidAffected].points + gameEvent.points < 0 ? -this.board.game.players[uidAffected].points : gameEvent.points);
    } else {
      const goBack = gameEvent.step < 0;
      if (!goBack) {
        for (let i = 0; i < gameEvent.step; i++) {
          await this.singlePlayerService.waitFor(_newMoveInterval);
          this.board.game.players[uidAffected].position++;
          this.audioService.playMoveSound();
          // check if reached the end
        }
      } else {
        for (let i = gameEvent.step; i < 0; i++) {
          await this.singlePlayerService.waitFor(_newMoveInterval);
          this.board.game.players[uidAffected].position--;
          this.audioService.playMoveSound();
        }
      }
    }


    // this.changeTurn();
    // roll dice
    console.log(this.board.game);



    const isBotTurn = this.board.game.turnIndex === 1;
    if (isBotTurn) {
      // roll for bot
      await this.singlePlayerService.waitFor(2000);
      this.rollDice('bot');
    } else {
      this.canRoll = true;
    }
  }

  changeTurn(): void {
    this.board.game.turnIndex = this.board.game.turnIndex === 0 ? 1 : 0;
  }
}
