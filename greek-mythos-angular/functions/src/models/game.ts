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
    }
}

export interface Players {
    [uid: string]: Player;
}

export interface Player {
    uid: string;
    displayName: string;
    position: number;
    turnIndex: number;
    hero: string;
    points: number;
    oldPosition?: number;
    helpUsed: {
        help_50: number,
        skip: number
    };
    imageUrl?: string;
}

export interface Question {
    id: string;
    text: string;
    diff: 'easy' | 'medium' | 'hard';
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
    step?: number;
    text: string;
    isGood: boolean;
    points?: number;
}

export interface Room {
    roomId: string;
    diff: 'easy' | 'medium' | 'hard';
    name: string;
    hostUid: string;
    hostName: string;
    actP: number;
    max: number;
    players: Players;
    isSmall: boolean;
    start?: string;
    maxHelps: {
        help_50: number,
        skip: number
    },
    minPoints: number;
}

export interface User {
    uid: string;
    displayName: string;
    createdAt: number | Object;
    lastOnline: number | Object;
    email: string;
    active: boolean;
    imageUrl?: string;
    gamesPlayed?: number;
    gamesWon?: number;
    inGame?: {
        gameId: string;
        timestamp: number;
    }
}




export type QuestionState = 'waitingAns' | 'answered' | 'failed' | 'skipped' | 'finishedP' | 'finishedM' | 'failedP' | 'failedM';

export type QuestionReward = 'points' | 'move' | 'remove_points' | 'go_back';