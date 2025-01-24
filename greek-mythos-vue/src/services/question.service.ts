import { getNumberFromZeroToX } from '../helpers/get-number-zero-to-x';
import { GameQuestion } from '../models/game';
import { ANSWER_REF, GET_DATA, QUESTION_ANSWER_REF, QUESTION_REF, SET_DATA } from '@/firebase';


export class QuestionService {

    constructor(
    ) { }

    async answerQuestion(gameId: string, answer: string): Promise<void> {
        try {
            
            await SET_DATA(ANSWER_REF(gameId), answer);
        } catch (error) {
            console.error('error when adding answer');
        }
    }

    /**
     * Retrieves a random question from the database
     * with the playerUid and without the correct answer
     * @param playerUid The player's uid
     * @returns A game question with the playerUid
     */
    getRandomQuestion(playerUid: string): Promise<GameQuestion> {
        const r = getNumberFromZeroToX(101);
        const id = `question_${r}`;
        return GET_DATA(QUESTION_REF(id)).then(d => ({
            question: d.val(),
            playerUid,
            state: 'waitingAns',
        } as GameQuestion));
    }
 
    /**
     * Retrieves the answer for a specific question
     * @param questionId The question's id
     * @returns The answer (string) of the question
     */
    getAnswerForQuestion(questionId: string): Promise<string> {
        return GET_DATA(QUESTION_ANSWER_REF(questionId)).then(d => d.val());
    }
}

