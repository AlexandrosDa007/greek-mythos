import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Game, GameQuestion } from 'src/app/models/game';
import { User } from 'src/app/models/user';
import { GameService } from 'src/app/services/game.service';
import { TimerService } from 'src/app/services/timer.service';
import { HELPS } from 'src/environments/environment';

@Component({
  selector: 'app-question-modal',
  templateUrl: './question-modal.component.html',
  styleUrls: ['./question-modal.component.scss']
})
export class QuestionModalComponent implements OnInit {

  help = HELPS;

  diffToStepsMap = {
    'easy': `1 βήμα`,
    'medium': `2 βήματα`,
    'hard': `3 βήματα`,
  };

  @Input() IS_SINGLE = false;
  @Input() question: GameQuestion;
  @Input() game: Game;
  @Input() user: User;
  @Input() canDoAction: boolean;

  @Output() answeringQuestion = new EventEmitter();
  @Output() getHelpEvent = new EventEmitter();
  @Output() getRewardEvent = new EventEmitter();

  isMyQuestion: boolean;

  destroy = new EventEmitter();

  @Output() qTurnFinished = new EventEmitter();

  qTimer = 100;


  constructor(
    private gameService: GameService,
    private timerService: TimerService,
  ) { }

  ngOnInit(): void {
    console.log(this.canDoAction);

    this.isMyQuestion = this.question.playerUid === this.user.uid;
    this.startQuestionTimer();
  }

  canGetHelp(help: 'help_50' | 'help_skip'): boolean {
    const maxHelps = help === 'help_50' ? this.game.maxHelps.help_50 : this.game.maxHelps.skip;
    const userHelps = help === 'help_50' ? this.game.players[this.user.uid].helpUsed.help_50 : this.game.players[this.user.uid].helpUsed.skip;
    const pointsNeeded = help === 'help_50' ? this.help.help_50 : this.help.skip;
    const userPoints = this.game.players[this.user.uid].points;

    const hasEnoughHelps = userHelps < maxHelps;
    const hasEnoughPoints = userPoints >= pointsNeeded;

    return (this.isMyQuestion && this.canDoAction && hasEnoughPoints && hasEnoughHelps);
  }

  getHelp(ans: string): void {
    this.canDoAction = false;
    this.destroy.emit();
    this.qTimer = 100;
    if (ans === 'help_50') {
      this.startQuestionTimer();
    }
    this.getHelpEvent.emit(ans);
  }

  getReward(rewardType: 'points' | 'move' | 'go_back' | 'remove_points'): void {
    this.canDoAction = false;
    this.getRewardEvent.emit(rewardType);
  }

  answerQuestion(ans: string): void {
    this.canDoAction = this.IS_SINGLE ? true : false;
    this.destroy.emit();
    this.qTimer = null;
    this.answeringQuestion.emit(ans);
  }

  startQuestionTimer(): void {
    if ((this.isMyQuestion || this.IS_SINGLE) && this.question.state === 'waitingAns') {
      // start counter
      this.timerService.getQuestionTimer().pipe(takeUntil(this.destroy))
        .subscribe(v => {
          if (v === -999) {

            this.qTimer = null;
            this.destroy.emit();
            this.qTurnFinished.emit(true);
            return;
          }
          const rel = ((100 * v) / 150);
          this.qTimer = rel;
        });
    }
  }

}
