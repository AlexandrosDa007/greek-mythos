import { readFileSync, outputFileSync } from "fs-extra";

export interface QuestionOld {
    text: string;
    q0: string;
    q1: string;
    q2: string;
    q3: string;
    correct: '1η' | '2η' | '3η' | '4η';
    diff: 'Μέτριο' | 'Εύκολο' | 'Δύσκολο';
}

export interface Question {
    id: string;
    text: string;
    diff: 'easy' | 'medium' | 'hard';
    answers: string[];
    correct: string;
    qPoints: number;
}

const diffMap: Record<string, 'easy' | 'medium' | 'hard'> = {
    'Εύκολο': 'easy',
    'Μέτριο': 'medium',
    'Δύσκολο': 'hard'
};

const qMap: Record<string, number> = {
    '1η': 0,
    '2η': 1,
    '3η': 2,
    '4η': 3
};

const qPointsMap: Record<string, number> = {
    'easy': 20,
    'medium': 30,
    'hard': 50
};

const questionFileName = 'data/thesisquestions.json';

const questionsJSON = readFileSync(questionFileName, 'utf-8');

const questions: QuestionOld[] = JSON.parse(questionsJSON);

const newQuestions: Record<string, Question> = {};

const getNewAnswers = (question: QuestionOld): { answers: string[], correct: string } => {
    const answers = [];
    answers.push(question.q0.toString());
    answers.push(question.q1.toString());
    answers.push(question.q2.toString());
    answers.push(question.q3.toString());
    const correct = answers[qMap[question.correct]];
    return { answers, correct };
}

questions.forEach((q, index) => {
    const id = `question_${index}`;
    const { answers, correct } = getNewAnswers(q);
    const diff = diffMap[q.diff];
    const qPoints = qPointsMap[diff];
    newQuestions[id] = {
        id,
        text: q.text,
        diff,
        answers,
        correct,
        qPoints
    };
});

const newQJson = JSON.stringify(newQuestions, undefined, 2);


outputFileSync(`results/newQuestions.json`, newQJson);

