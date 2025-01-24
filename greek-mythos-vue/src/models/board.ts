import { Game } from "./game";

export interface Cell {
    index: number
}

export interface Board {
    rows: Row[],
    game: Game;
}

export interface Player {
    // name: string;
    position?: number;
    hero?: Hero;
    uid: string;
    displayName: string;
    ready: boolean;
    turnIndex?: number;
    points?: number;
    oldPosition?: number;
    helpUsed: {
        help_50: number,
        skip: number
    };
    imageUrl?: string;

}

export interface Players {
    [uid: string]: Player;
}

export interface Row {
    cells: Cell[];
}

export interface Hero {
    name: 'achilles' | 'hercules' | 'perseus' | 'hippolyta';
    icon?: 'achillesHead.png' | 'herculesHead.png' | 'perseusHead.png' | 'ippoHead.png';
}
