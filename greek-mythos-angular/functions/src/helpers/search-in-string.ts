const greekAbc = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωάΆέΈήΉίΊϊΪΐόΌύΎϋΰώΏ yY';
const engliAbc = 'abgdeziθiklmnξoprstufxψoabgdeziθiklmnξoprstufxψoaaeeiiiiiiioouuuuoo uu';
const greeklishDoubleMap = {
    'θ': 'th',
    'ξ': 'ks',
    'ψ': 'ps',
    'Θ': 'th',
    'Ξ': 'ks',
    'Ψ': 'ps',
};
const greeklishMap: any = {
    ...greekAbc.split('').reduce((result, greekChar, index) => {
        return { ...result, [greekChar]: engliAbc[index] };
    }, {} as Record<string, string>),
    ...greeklishDoubleMap,
};

function toGreeklish(text: string): string {
    return text.split('').map(greekChar => greeklishMap[greekChar] ?? greekChar).join('');
}

export function searchInString(string: string, term: string): boolean {

    const greeklishString = toGreeklish(string);
    const greeklistTerm = toGreeklish(term);

    const lowerString = greeklishString.toLowerCase().trim();
    const lowerTerm = greeklistTerm.toLowerCase().trim();

    if (lowerTerm.includes(' ')) {
        // search term is multiple words, search as substring in `string`
        return lowerString.includes(lowerTerm);
    } else {
        // search term is single word, search in the beginning of every word in `string`
        const words = lowerString.toLowerCase().split(' ');
        return words.some(word => word.startsWith(lowerTerm));
    }

}
