const fs = require('fs');
const csv = require('csvtojson');
const paths = ["nouns.csv", "other.csv", "verbs.csv"];

for (const path of paths) {
    csv()
    .fromFile(`${__dirname}/../data/${path}`)
    .then(async (unsortedObj) => {
        const stream = fs.createWriteStream(`${__dirname}/data/${path}`, {flags:'a'});

        for (let i = 0; i < unsortedObj.length; i++) {
            switch (path) {
                case "nouns.csv":
                    stream.write(`noun,`);
                    break;
                case "verbs.csv":
                    stream.write(`verb,`);
                    break;
                case "other.csv":  
                    stream.write(`other,`);
                    break;
            }
            let j = 0;
            for (const [key, value] of Object.entries(unsortedObj[i])) {
                if (j != 0) stream.write(',');
                stream.write(
                    `${value.includes(',') || value.includes('\n')? '"' : ''}` +
                    `${value}` +
                    `${value.includes(',') || value.includes('\n')? '"' : ''}`
                )
                
                j++;
            }
            stream.write('\n');
        }
    })
}