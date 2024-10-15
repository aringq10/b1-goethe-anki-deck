const fs = require('fs');
const csv = require('csvtojson');
const unsortedPath = `${__dirname}/data/nouns.csv`;
const sortedPath = `${__dirname}/data/100k_words.csv`;

csv()
.fromFile(unsortedPath)
.then(async (unsortedObj) => {
    // const sortedStream = fs.createWriteStream(`${__dirname}/sorted.csv`, {flags:'a'});
    const unsortedStream = fs.createWriteStream(`${__dirname}/unsorted.csv`, {flags:'a'});
    let exist = 0;
    let dont_exist = 0;

    csv()
    .fromFile(sortedPath)
    .then(async (sortedObj) => {
        for (let i = 0; i < unsortedObj.length; i++) {
            let exists = false;
            let word = unsortedObj[i].german;
            // let word = unsortedObj[i].german.slice(unsortedObj[i].german.indexOf(' ') + 1);
            for (let j = 0; j < sortedObj.length; j++) {
                if (sortedObj[j].german == word) {
                    exists = true;
                    exist++;
                    break;
                }
            }
            if (!exists) {
                dont_exist++;
                unsortedStream.write(`${word}\n`);
            }
        }

        console.log(`exist: ${exist}\ndont exist: ${dont_exist}`);
    })
})
