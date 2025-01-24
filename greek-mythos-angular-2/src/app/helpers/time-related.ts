/**
 * Returns a formated string with hours/minutes/seconds from
 * a time (in milliseconds) provided
 * @param timeInMs The time you want in milliseconds
 * @returns A string formated like hh:mm:ss
 */
export function getHoursMinutesSecondsFromMilli(timeInSeconds: number): string {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = (Math.floor(timeInSeconds / 60) % 60);
    const seconds = timeInSeconds % 60;

    if (hours >= 24) {
        return `Πάνω απο μια μέρα`;
    }

    return `
        ${hours < 10 ? '0'+hours.toFixed(0): hours.toFixed(0)}:${minutes < 10 ? '0'+minutes.toFixed(0): minutes.toFixed(0)}:${seconds < 10 ? '0'+seconds.toFixed(0): seconds.toFixed(0)}
    `;
}