import { Players } from "./board";

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