var MersenneTwister = require('mersenne-twister');
var generator = new MersenneTwister();

const wtf: any = {};

for (let i = 0; i < 10000000; i++) {
    const r = Math.floor(generator.random() * 6) + 1;
    if (!wtf[r]) {
        wtf[r] = 0;
    }
    wtf[r]++;
}


console.log(wtf);
