import { Question } from "../models/game";
import { shuffle } from "./shuffle";

export function halveAnswers(question: Question, correct: string): string[] {
    const wrongAnswers = question.answers.filter(answer => answer !== correct);
    const secondAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    const newAnswers = [correct, secondAnswer];
    const randomAnswers = shuffle(newAnswers);
    return randomAnswers;
}
