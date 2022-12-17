import { EventContext, database, Change } from 'firebase-functions';
import { rootRef } from '../constants/refs';
import { SERVER_TIMESTAMP } from '../constants/timestamp';
import { asyncError } from '../helpers/async-error';
import { halveAnswers } from '../helpers/help-half-answers';
import { Game, Question } from '../models/game';

export const HELPS = {
    skip: 5,
    help_50: 10,
};

export const answerQuestionHandler = (async (change: Change<database.DataSnapshot>, context: EventContext) => {

    if (!change.after.exists()) {
        console.warn('deleting answer?');
        return asyncError('deleting answer?');
    }
    const gameId = context.params.gameId;
    const uid = context.auth?.uid;
    const answer = change.after.val();
    if (!uid) {
        return asyncError('No uid provided')
    }

    // validate stuff
    const game: Game = (await rootRef.child(`games/${gameId}`).once('value')).val();
    if (!game.question) {
        return asyncError('There is no question in the game');
    }


    // const oldPoints = game.players[uid].points;
    const question: Question = (await rootRef.child(`questions/${game.question.question.id}`).once('value')).val();

    const correct: string = (await rootRef.child(`questionAnswers/${question.id}`).get()).val()

    // If user has not answered but skipped or 50/50
    // TODO: maybe there is a better way of doing this - check if you have time

    const isHelp50 = answer === 'help_50';
    const isHelpSkip = answer === 'help_skip';


    // If player used help 50 - 50
    if (isHelp50) {
        if (game.players[uid].helpUsed.help_50 >= game.maxHelps.help_50) {
            return asyncError('User does not have enough helps!');
        }
        if (game.players[uid].points < HELPS.help_50) { return asyncError('User does not have enough points to use the help!'); }
        const newAnswers = halveAnswers(question, correct);
        if (newAnswers.length === 0) { return asyncError('Something went wrong when cutting answers to half!'); }
        const helpUpdate: any = {};
        helpUpdate[`question/question/answers`] = newAnswers;
        helpUpdate[`question/state`] = 'waitingAns';
        helpUpdate[`players/${uid}/points`] = game.players[uid].points - HELPS.help_50;
        helpUpdate[`players/${uid}/helpUsed/help_50`] = game.players[uid].helpUsed.help_50 + 1;
        helpUpdate[`updatedAt`] = SERVER_TIMESTAMP;
        await rootRef.child(`games/${game.id}`).update(helpUpdate);
        return true;
    }

    // if player skipped question
    if (isHelpSkip) {
        if (game.players[uid].helpUsed.skip >= game.maxHelps.skip) {
            return asyncError('User does not have enough helps!');
        }
        if (game.players[uid].points < HELPS.skip) { return asyncError('User does not have enough points to use the help!'); }
        const helpUpdate: any = {};
        helpUpdate[`question/state`] = 'skipped';
        helpUpdate[`players/${uid}/points`] = game.players[uid].points - HELPS.skip;
        helpUpdate[`players/${uid}/helpUsed/skip`] = game.players[uid].helpUsed.skip + 1;
        helpUpdate[`turnIndex`] = game.nextTurn;
        helpUpdate[`nextTurn`] = null;
        helpUpdate[`updatedAt`] = SERVER_TIMESTAMP;
        await rootRef.child(`games/${game.id}`).update(helpUpdate);
        return true;
    }


    const userWasCorrect = correct === answer;

    const updateStuff: any = {};
    updateStuff[`question/question/correct`] = correct;
    updateStuff[`question/state`] = userWasCorrect ? 'answered' : 'failed';
    updateStuff[`updatedAt`] = SERVER_TIMESTAMP;
    await rootRef.child(`games/${gameId}`).update(updateStuff);

    return true;
});
