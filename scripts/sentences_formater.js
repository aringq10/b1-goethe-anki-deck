const fs = require('fs');
const csv = require('csvtojson');

csv()
.fromFile(`${__dirname}/../data/sorted/complete_list_sorted.csv`)
.then(async (jsonObj) => {
    const stream = fs.createWriteStream(`${__dirname}/../data/sentences.csv`, {flags:'a'});

    for (let i = 0; i < jsonObj.length; i++) {
        const type = jsonObj[i].type;
        const word = jsonObj[i].german;

        let row = `${type.includes(',') ? '"' : ''}` +
                    `${type}` +
                    `${type.includes(',') ? '"' : ''},` +
                    `${word.includes(',') ? '"' : ''}` +
                    `${word}` +
                    `${word.includes(',') ? '"' : ''},`;

        for (let j = 0; j < 10; j++) {
            if (!jsonObj[i][`s${j + 1}`]) break;
            const line = `${row}` +
                            `${jsonObj[i][`s${j + 1}`].includes(',') ? '"' : ''}` +
                            `${jsonObj[i][`s${j + 1}`]}` +
                            `${jsonObj[i][`s${j + 1}`].includes(',') ? '"' : ''},` +
                            `${jsonObj[i][`t${j + 1}`].includes(',') ? '"' : ''}` +
                            `${jsonObj[i][`t${j + 1}`]}` +
                            `${jsonObj[i][`t${j + 1}`].includes(',') ? '"' : ''}\n`;
            
            stream.write(line);
        }
    }
})