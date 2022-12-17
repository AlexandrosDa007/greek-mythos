import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { first, map } from 'rxjs/operators';
import { getNumberFromZeroToX } from '../helpers/get-number-zero-to-x';
import { GameQuestion, Question } from '../models/game';

@Injectable({
    providedIn: 'root'
})
export class QuestionService {

    constructor(
        private db: AngularFireDatabase,
    ) { }

    async answerQuestion(gameId: string, answer: string): Promise<void> {
        try {
            await this.db.object(`games/${gameId}/question/question/answer`).set(answer);
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
        return this.db.object<any>(`questions/${id}`).valueChanges().pipe(
            map(question => {
                return {
                    question,
                    playerUid,
                    state: 'waitingAns',
                } as GameQuestion
            }),
            first()
        ).toPromise();
    }

    /**
     * Retrieves the answer for a specific question
     * @param questionId The question's id
     * @returns The answer (string) of the question
     */
    getAnswerForQuestion(questionId: string): Promise<string> {
        return this.db.object<string>(`questionAnswers/${questionId}`).valueChanges().pipe(first()).toPromise();
    }
}

