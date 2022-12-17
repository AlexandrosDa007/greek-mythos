
// TODO: create better loggin
export function log(msg: string, details?: any) {
    console.log(msg, details);
}

export function logError(msg: string, errorDetails?: any) {
    console.error(msg, errorDetails);
}
