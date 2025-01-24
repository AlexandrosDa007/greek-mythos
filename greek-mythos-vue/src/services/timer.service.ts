

export const timer = (dueTime = 0, schedule = 0, stopWhen = 999999) => {
    let _interval: any = null;
    let i = dueTime;
    const startTimer = (callback: Function) => {
        setTimeout(() => {
            _interval = setInterval(() => {
                i+=schedule;
                if (stopWhen >= i) {
                    //stop
                    callback(-999);
                    clearInterval(_interval!);
                    return;
                }
                callback(i)
            }, schedule);
        }, dueTime);
    }

    const reset = () => {
        stop();
        i = dueTime;
    }

    const subscribe = (callback: (v: number) => void) => {
        startTimer(callback);
    }

    const stop = () => {
        _interval && clearInterval(_interval);
        _interval = null;
    }

    return {
        subscribe,
        stop,
        reset,
    }

}


export const TURN_TIMEOUT = 90; // in seconds

export const AFK_TIMER = 240; // 4min

export const QUESTION_TIMEOUT = 150;

export const EVENT_TIMEOUT = 5;

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
