import { Injectable } from '@angular/core';
import { Observable, OperatorFunction, timer } from 'rxjs';
import { map } from 'rxjs/operators';

export const TURN_TIMEOUT = 90; // in seconds

export const AFK_TIMER = 240; // 4min

export const QUESTION_TIMEOUT = 150;

export const EVENT_TIMEOUT = 5;
@Injectable({
    providedIn: 'root'
})
export class TimerService {

    gameTimout = 10000; // game inactive in 200seconds



    timer$ = timer(0, 1000);


    constructor() { }

    getTurnTimer(): Observable<number> {
        return this.timer$.pipe(
            map(v => {
                if (v < TURN_TIMEOUT) {
                    return (TURN_TIMEOUT - v);
                }
                else {
                    return -999;
                }
            })
        );
    }

    getLastUpdateGame(turnIndex: number): Observable<number> {
        return timer(0, 1000).pipe(
            map(v => {
                if (v === 1) {
                    console.log('%c Starting timer...', 'background: blue; color: white;padding: 5px;');

                }
                if (v < this.gameTimout + (2 * turnIndex)) {
                    return (this.gameTimout - v);
                } else {
                    return -999;
                }
            })
        );
    }


    getFiveSecondTimer(): Observable<number> {
        return timer(0, 100).pipe(
            map(v => {
                if (v < 50) {
                    return (50-v);
                } else {
                    return -999;
                }
            })
        );
    }

    getAfkPlayerTimer(turnIndex: number): Observable<number> {
        return timer(0, 1000).pipe(
            map(v => {
                if (v === 1) { console.log(`%c Starting afk timer`, 'background: pink;color:white;padding: 2px;'); }
                if (v < AFK_TIMER + (2 * turnIndex)) {
                    return (AFK_TIMER - v);
                } else {
                    return -999;
                }
            })
        )
    }

    getQuestionTimer(): Observable<number> {
        return timer(0, 100).pipe(
            map(v => {
                if (v < QUESTION_TIMEOUT) {
                    return (QUESTION_TIMEOUT - v);
                }
                else {
                    return -999;
                }
            })
        );
    }

    startTimerGameTimestamp(timestamp: number): Observable<number> {
        return timer(0, 1000).pipe(
            map(v => {
                return (Date.now() - timestamp) / 1000;
            })
        );
    }

}

/**
 * Operator function to log stuff
 * @param message The message to display
 */
export function log<T>(message: string): OperatorFunction<T, T> {
    return function (source$: Observable<T>): Observable<T> {
        return new Observable<T>(observer => {
            const wrapper: {
                next: (value: any) => void;
                error: () => void;
                complete: () => void
            } = {
                next: value => {
                    console.log(message, value);
                    observer.next(value);
                },
                error: observer.error,
                complete: observer.complete
            }
            return source$.subscribe(wrapper);
        })
    }
}
