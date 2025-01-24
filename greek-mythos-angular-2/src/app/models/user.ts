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