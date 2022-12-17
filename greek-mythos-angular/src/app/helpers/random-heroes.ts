import { Hero } from "../models/board"


export const allHeroes: Hero[] = [
    {
        name: 'achilles',
        icon: 'achillesHead.png'
    },
    {
        name: 'hercules',
        icon: 'herculesHead.png'
    },
    {
        name: 'hippolyta',
        icon: 'ippoHead.png'
    },
    {
        name: 'perseus',
        icon: 'perseusHead.png'
    }
];


export const getRandomHeroArray = (): Hero[] => {
    return shuffle(allHeroes) as Hero[];
};


export const shuffle = (array => {
    let currentIndex = array.length;
    let temporaryValue = 0;
    let randomIndex = 0;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) { 
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
});