import { Players } from "./board";

export interface Game {
    id: string;
    createdAt: number;
    updatedAt: number;
    players: Players;
    turnIndex: number;
    isSmall: boolean;
    question?: GameQuestion;
    nextTurn?: number;
    gameEvent?: GameEvent;
    gameOver?: Record<string, string> | true;
    minPoints: number;
    diceResult?: number;
    maxHelps: {
        help_50: number,
        skip: number
    },
}

export interface Question {
    id: string;
    diff: 'easy' | 'medium' | 'hard';
    text: string;
    answers: string[];
    answer?: string;
    correct?: string;
    qPoints: number;
}

export interface GameQuestion {
    question: Question;
    playerUid: string;
    state: QuestionState;
}

export interface GameEvent {
    id: string;
    playerUid: string;
    isGood: boolean;
    text: string;
    step?: number;
    points?: number;
}

export type QuestionState = 'waitingAns' | 'answered' | 'failed' | 'skipped' | 'finishedP' | 'finishedM' | 'failedP' | 'failedM';

export type QuestionReward = 'points' | 'move' | 'remove_points' | 'go_back';