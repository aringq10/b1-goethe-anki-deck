const fs = require('fs');
const csv = require('csvtojson');
const paths = ["complete_list.csv", "nouns.csv", "other.csv", "verbs.csv"];
const unsortedPath = `${__dirname}/../data/complete_list.csv`;
const sortedPath = `${__dirname}/../data/50k_frequency_list.csv`;

for (const path of paths) {
    csv()
    .fromFile(`${__dirname}/../data/${path}`)
    .then(async (unsortedObj) => {
        let exist = 0;
        let dont_exist = 0;
        let sortedWords = [];
        const sortedStream = fs.createWriteStream(`${__dirname}/data/${path}`, {flags:'a'});
        const unsortedStream = fs.createWriteStream(`${__dirname}/data/unsorted.csv`, {flags:'a'});

        csv()
        .fromFile(sortedPath)
        .then(async (sortedObj) => {
            for (let i = 0; i < unsortedObj.length; i++) {
                let exists = false;
                let word;
                // Format word for comparison
                if (unsortedObj[i].german.slice(0, 1) == '(') {
                    word = unsortedObj[i].german.slice(unsortedObj[i].german.indexOf(')') + 1);
                }
                else if (unsortedObj[i].german.includes("sich")) {
                    word = unsortedObj[i].german.slice(unsortedObj[i].german.indexOf(' ') + 1);
                }
                else if (unsortedObj[i].german.includes(",")) {
                    word = unsortedObj[i].german.slice(0, unsortedObj[i].german.indexOf(','));
                }
                else if (unsortedObj[i].german.includes("/")) {
                    word = unsortedObj[i].german.slice(0, unsortedObj[i].german.indexOf('/'));
                }
                else if (unsortedObj[i].german.includes("-")) {
                    word = unsortedObj[i].german.slice(0, unsortedObj[i].german.indexOf('-'));
                }
                else {
                    word = unsortedObj[i].german;
                }
                word = word.replace(' ', '');

                // Compare and sort
                for (let j = 0; j < sortedObj.length; j++) {
                    if (sortedObj[j].german.slice(0, sortedObj[j].german.indexOf(' ')).toLowerCase() == word.toLowerCase()) {
                        let tempIndex = j;
                        while (true) {
                            if (sortedWords[tempIndex]) {
                                tempIndex++;
                            }
                            else {
                                sortedWords[tempIndex] = i;
                                break;
                            }
                        }
                        exist++;
                        exists = true;
                        break;
                    }
                }
                // Write out non existing words in another file
                if (!exists) {
                    unsortedStream.write(`${unsortedObj[i].german}\n`);
                    dont_exist++;
                }
            }

            // Write sorted csv
            for (let i = 0; i < sortedWords.length; i++) {
                if (!sortedWords[i] && sortedWords[i] != 0) continue;
                let j = 0;
                for (const [key, value] of Object.entries(unsortedObj[sortedWords[i]])) {
                    if (j != 0) sortedStream.write(',');
                    sortedStream.write(
                        `${value.includes(',') || value.includes('\n')? '"' : ''}` +
                        `${value}` +
                        `${value.includes(',') || value.includes('\n')? '"' : ''}`
                    )
                    
                    j++;
                }
                sortedStream.write('\n');
            }
            unsortedStream.write('\n');
        })
    })
}