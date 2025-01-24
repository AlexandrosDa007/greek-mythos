import { EVENTS_MAP_BIG, EVENTS_MAP_SMALL, HELPS, QUESTIONS_MAP_BIG, QUESTIONS_MAP_SMALL } from "@/environment";
import { getNumberFromZeroToX } from "@/helpers/get-number-zero-to-x";
import { halveAnswers } from "@/helpers/half-answers";
import { getSpiralFormOfArray } from "@/helpers/matrix";
import { objectKeys, objectValues } from "@/helpers/object-keys-values";
import { Board } from "@/models/board";
import { GameEvent, GameQuestion } from "@/models/game";
import { SinglePlayerService } from "@/pages/SinglePlayer/single-player.service";
import { AudioService } from "@/services/audio.service";
import { QuestionService } from "@/services/question.service";
import { timer } from "@/services/timer.service";
import { useUserStore } from "@/store/user";
import { computed, Ref, ref } from "vue"

export function useSinglePlayer() {
    const MOVE_INTERVAL = 500;
    const DIFF_TO_STEPS_MAP: any = {
        'easy': 1,
        'medium': 2,
        'hard': 3
    };
    const singlePlayerService = new SinglePlayerService();
    const audioService = new AudioService();
    const questionService = new QuestionService();
    /**
     * Who is the current player
     */
    const turnPlayer = ref();
    const canRoll = ref(false);
    const diceResult = ref();
    const canShowDiceAnimation = ref(false);
    const canDoAction = ref(false);
    const board = ref<Board>({} as Board);
    const gameQuestionsMap = ref<any>({});
    const gameEventsMap = ref<any>({});
    const lastStep = ref(0);
    const gameOverPlayer = ref('');
    const activeGameEvent = ref<GameEvent | null | undefined>(null);
    const activeQuestion = ref<GameQuestion | null | undefined>(null);
    const isMyQuestion = ref(false);
    const isMyGameEvent = ref(false);
    const fiveSecondTimer = ref(100);
    const started = ref(false);
    const showSettings = ref(false);

    const { userProfile } = useUserStore();
    console.log(userProfile);
    

    const startGame = ({isSmall, minPoints, maxHelps}: {isSmall: boolean, minPoints: number, maxHelps: {help_50: number, skip: number}}) => {
        // and stuff
        board.value = {
            rows: [],
            game: {
                isSmall: isSmall,
                minPoints: minPoints,
                maxHelps: maxHelps,
                createdAt: 0,
                id: '',
                players: singlePlayerService.getSinglePlayerPlayers(),
                turnIndex: 0,
                updatedAt: 0,
            }
        }
        lastStep.value = isSmall ? 49 : 100;
        setUpBoard();

        canRoll.value = true;
        canDoAction.value = true;
        turnPlayer.value = userProfile!.displayName;
        started.value = true;
        audioService.playBackgroundMusic();
    }
    
    const setUpBoard = () => {

        const rows = board.value.game.isSmall ? 7 : 10;
        const spiralArray = getSpiralFormOfArray(rows);

        for (let i = 0; i < rows; i++) {
            board.value.rows[i] = {
                cells: []
            }
            for (let j = 0; j < spiralArray[i].length; j++) {
                board.value.rows[i].cells[j] = {
                    index: spiralArray[i][j],
                };
            }
        }
        if (board.value.game.isSmall) {
            QUESTIONS_MAP_SMALL.forEach(question => gameQuestionsMap.value[question] = true);
            EVENTS_MAP_SMALL.forEach(gameEvent => gameEventsMap.value[gameEvent] = true);
        } else {
            QUESTIONS_MAP_BIG.forEach(question => gameQuestionsMap.value[question] = true);
            EVENTS_MAP_BIG.forEach(gameEvent => gameEventsMap.value[gameEvent] = true);
        }
        lastStep.value = board.value.game.isSmall ? 49 : 100;
    }

    const rollDice = async (uid: string) => {
        turnPlayer.value = objectValues(board.value.game.players).find(player => player.turnIndex === board.value.game.turnIndex)?.displayName;
        const isBot = uid === 'bot';
        canRoll.value = false;
        const newDiceRoll = getNumberFromZeroToX(6) + 1;

        // show dice animation
        diceResult.value = newDiceRoll;
        canShowDiceAnimation.value = true;
        await new Promise(res => setTimeout(res, 3000));
        canShowDiceAnimation.value = false;

        let mode: 'question' | 'event' | 'gameOver' | 'move' = 'move';
        // is new position event or question
        if (gameQuestionsMap.value[(board.value.game.players[uid].position ?? 1) + newDiceRoll]) {
            // its a question
            mode = 'question';
            } else if (gameEventsMap.value[(board.value.game.players[uid].position ?? 1) + newDiceRoll]) {
            // its an event
            mode = 'event';
            } else if ((board.value.game.players[uid].position ?? 1) + newDiceRoll >= lastStep.value) {
            // game over or not enought points
            mode = 'gameOver';
        }
        // otherwise just move
        board.value.game.players[uid].oldPosition = board.value.game.players[uid].position;
        changeTurn();
        await singlePlayerService.handleRoll(board.value.game, newDiceRoll, mode, uid);

        if (board.value.game.gameOver) {
        // game is over
            gameOverPlayer.value = board.value.game.players[objectKeys(board.value.game.gameOver)[0]].displayName;
            console.log(board.value.game);

            return;
        }

        activeGameEvent.value = board.value.game.gameEvent;
        activeQuestion.value = board.value.game.question;
        isMyQuestion.value = board.value.game.question?.playerUid === uid;
        isMyGameEvent.value = board.value.game.gameEvent?.playerUid === uid;

        if (!activeGameEvent.value && !activeQuestion.value) {
        // play with bot
        if (isBot) {
            canRoll.value = true;
        } else {
            await new Promise(res => setTimeout(res, 2000));
            rollDice('bot');
            return;
        }
        }

        if (activeGameEvent.value) {
            // start a timeout
            timer(0, 100, 5000)
                .subscribe(v => {
                    if (v === -999) {
                        removeFiveSecondTimer();
                        return;
                    }
                    const rel = ((100 * v) / 50);
                    fiveSecondTimer.value = rel;
                });
        }

        if (activeQuestion.value && uid === 'bot') {
        await answerQuestionForBot();
        }

        turnPlayer.value = objectValues(board.value.game.players).find(player => player.turnIndex === board.value.game.turnIndex)?.displayName;
    }

    
    const changeTurn = () => {
        board.value.game.turnIndex = board.value.game.turnIndex === 0 ? 1 : 0;
    }

    const removeFiveSecondTimer = async () => {
        const uidAffected = activeGameEvent.value!.playerUid;
        fiveSecondTimer.value = 100;
        activeGameEvent.value = null;
        isMyGameEvent.value = false;
        const gameEvent = board.value.game.gameEvent;
    
    
        const _newMoveInterval = gameEvent?.id === 'gameEvent_CUSTOM' ? 100 : MOVE_INTERVAL;
    
        // do event action
        if (gameEvent!.points) {
          board.value.game.players[uidAffected].points! += (board.value.game.players[uidAffected].points! + gameEvent!.points < 0 ? -board.value.game.players[uidAffected].points! : gameEvent!.points);
        } else {
          const goBack = gameEvent!.step! < 0;
          if (!goBack) {
            for (let i = 0; i < gameEvent!.step!; i++) {
              await singlePlayerService.waitFor(_newMoveInterval);
              board.value.game.players[uidAffected].position!++;
              audioService.playMoveSound();
              // check if reached the end
            }
          } else {
            for (let i = gameEvent!.step!; i < 0; i++) {
              await singlePlayerService.waitFor(_newMoveInterval);
              board.value.game.players[uidAffected].position!--;
              audioService.playMoveSound();
            }
          }
        }
    
    
        // this.changeTurn();
        // roll dice
        console.log(board.value.game);
    
    
    
        const isBotTurn = board.value.game.turnIndex === 1;
        if (isBotTurn) {
          // roll for bot
          await singlePlayerService.waitFor(2000);
          rollDice('bot');
        } else {
          canRoll.value = true;
        }
    }

    const answerQuestionForBot = async () => {
        await singlePlayerService.waitFor(3000);
        // answer random
        const _randomNumber = getNumberFromZeroToX(4);
        activeQuestion.value!.question.answer = activeQuestion.value!.question.answers[_randomNumber];
    
        // get correct
        const correct = await questionService.getAnswerForQuestion(activeQuestion.value!.question.id);
        activeQuestion.value!.question.correct = correct;
        await singlePlayerService.waitFor(2000);
        const wasCorrect = activeQuestion.value!.question.answer === correct;
        activeQuestion.value!.state = wasCorrect ? 'answered' : 'failed';
    
        await singlePlayerService.waitFor(2000);
    
    
        if (wasCorrect) {
          const choices = ['move', 'points'];
          // randomize reward
          const _r1 = getNumberFromZeroToX(1);
          getReward(choices[_r1] as any);
        } else {
          const choices = ['go_back', 'remove_points'];
          const hasEnoughPoints = board.value.game.players[activeQuestion.value!.playerUid].points! >= activeQuestion.value!.question.qPoints;
    
          if (hasEnoughPoints) {
            const _r1 = getNumberFromZeroToX(1);
            getReward(choices[_r1] as any);
          } else {
            getReward('go_back');
          }
        }
    }

    const getReward = async (rewardType: 'points' | 'move' | 'go_back' | 'remove_points') => {
        console.log(rewardType);
        const affectedUid = activeQuestion.value!.playerUid;
        // set timeout to close
        switch (rewardType) {
          case 'move': {
            activeQuestion.value!.state = 'finishedM';
            const stepsToMove =DIFF_TO_STEPS_MAP[activeQuestion.value!.question.diff];
            for (let i = 0; i < stepsToMove; i++) {
              await singlePlayerService.waitFor(MOVE_INTERVAL);
              board.value.game.players[affectedUid].position!++;
              audioService.playMoveSound();
            }
            break;
          }
          case 'go_back': {
            activeQuestion.value!.state = 'failedM';
            for (let i = board.value.game.players[affectedUid].position!; i > board.value.game.players[affectedUid].oldPosition!; i--) {
              await new Promise(res => setTimeout(res, MOVE_INTERVAL));
              board.value.game.players[affectedUid].position! -= 1;
              audioService.playMoveSound();
            }
            break;
          }
          case 'points': {
            activeQuestion.value!.state = 'finishedP';
            board.value.game.players[affectedUid].points! += activeQuestion.value!.question.qPoints;
            break;
          }
          case 'remove_points': {
            activeQuestion.value!.state = 'failedP';
            const oldPoints = board.value.game.players[affectedUid].points!;
            if (oldPoints < activeQuestion.value!.question.qPoints) {
              // not enough points
              console.error('Not enough points');
              break;
            } else {
              board.value.game.players[affectedUid].points! -= activeQuestion.value!.question.qPoints;
              break;
            }
          }
        }
        await singlePlayerService.waitFor(5000);
        activeQuestion.value = null;
        if (affectedUid !== 'bot') {
          await new Promise(res => setTimeout(res, 2000));
          rollDice('bot');
        } else {
          canRoll.value = true;
        }
    }

    const getHelp = async (help: 'help_50' | 'help_skip') => {
        console.log(help);

        switch (help) {
            case 'help_50': {
                board.value.game.players[userProfile!.uid].points! -= HELPS.help_50;
                board.value.game.players[userProfile!.uid].helpUsed.help_50++;
                const newAnswers = halveAnswers(activeQuestion.value!.question);
                activeQuestion.value!.question.answers = newAnswers;
                break;
            }
            case 'help_skip': {
                board.value.game.players[userProfile!.uid].points! -= HELPS.skip;
                board.value.game.players[userProfile!.uid].helpUsed.skip++;
                activeQuestion.value!.state = 'skipped';
                await singlePlayerService.waitFor(5000);
                activeQuestion.value = null;
                rollDice('bot');
                break;
            }
        }
    }

    const qTurnFinished = async () => {
        await answerQuestion('');
    }

    const answerQuestion  = async (ans: string) => {
        const correct = await questionService.getAnswerForQuestion(activeQuestion.value!.question.id);
        activeQuestion.value!.question.answer = ans;
        activeQuestion.value!.question.correct = correct;
        if (ans === activeQuestion.value!.question.correct) {
            activeQuestion.value!.state = 'answered';
        } else {
            activeQuestion.value!.state = 'failed';
        }
    }

    const quitGame = () => location.reload();


    return {
        started,
        startGame,
        board,
        gameEventsMap,
        gameQuestionsMap,
        canShowDiceAnimation,
        diceResult,
        turnPlayer,
        canRoll,
        rollDice,
        canDoAction,
        getHelp,
        getReward,
        answerQuestion,
        qTurnFinished,
        activeQuestion,
        gameOverPlayer,
        quitGame,
        activeGameEvent,
        isMyGameEvent,
        fiveSecondTimer,
        showSettings,
    }

}