/**
 * Returns an integer between 0 and x-1
 * @param x The max number (excluding)
 */
export function getNumberFromZeroToX(x: number): number {
    return Math.floor(Math.random() * x);
}

function runShit(): void {
    for (let i = 0; i < 1000000; i++) {
        const r = getNumberFromZeroToX(6) + 1;
        if (r > 6 || r < 1) {
            console.log('wtf', r);
            return;
        }
    }
    console.log('ok');
    return;
}
