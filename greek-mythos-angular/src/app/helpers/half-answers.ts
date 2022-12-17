import { Question } from "../models/game";
import { shuffle } from "./random-heroes";

export function halveAnswers(question: Question): string[] {
    if (!question.correct) {
        console.error('Error: did not provide the correct answer');
        return [];
    }
    const correct = question.correct;
    const wrongAnswers = question.answers.filter(answer => answer !== correct);
    const secondAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    const newAnswers = [correct, secondAnswer];
    const randomAnswers = shuffle(newAnswers);
    console.log('Shuffled', randomAnswers);
    return randomAnswers;
}
