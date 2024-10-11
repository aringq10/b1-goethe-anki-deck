require('dotenv').config()
const fs = require('fs');
const csv = require('csvtojson');
const csvFilePath = `${__dirname}/data/other.csv`;

// DEEPL
const deepl = require('deepl-node');
const authKey = process.env.DEEPL_KEY;
const translator = new deepl.Translator(authKey);

csv()
.fromFile(csvFilePath)
.then(async (jsonObj) => {
    const stream = fs.createWriteStream(`${__dirname}/translated.csv`, {flags:'a'});
    try {
        for (let i = 0; i < jsonObj.length; i++) {
            // Get word translation
            const sentences = [];
            const result = await translator.translateText(jsonObj[i].german, 'de', 'en-US');
            const englishTranslation = result.text;
            
            // Get sentence translations
            for (const [key, value] of Object.entries(jsonObj[i])) {
                if (key == "german" || key == "german_full" || !value) continue;
                try {
                const result = await translator.translateText(value, 'de', 'en-US');
                const sentenceTranslation = result.text;
                sentences.push([value, sentenceTranslation]);
                }
                catch (err) {
                    console.log(err);
                }
            }

            // Write the whole line into the file
            stream.write(
                `${ jsonObj[i].german.includes(',') ? '"' : ''}` + 
                `${jsonObj[i].german}` + 
                `${ jsonObj[i].german.includes(',') ? '"' : ''},`
                +
                `${ englishTranslation.includes(',') ? '"' : ''}` + 
                `${englishTranslation.toLowerCase()}` + 
                `${ englishTranslation.includes(',') ? '"' : ''},`
                +
                `${ jsonObj[i].german_full.includes(',') ? '"' : ''}` + 
                `${jsonObj[i].german_full}` + 
                `${ jsonObj[i].german_full.includes(',') ? '"' : ''},`);
            
            for (let j = 0; j < sentences.length; j++) {
                stream.write(
                    `${sentences[j][0].includes(',') ? '"' : ''}` + 
                    `${sentences[j][0]}` + 
                    `${sentences[j][0].includes(',') ? '"' : ''},`
                    +
                    `${sentences[j][1].includes(',') ? '"' : ''}` + 
                    `${sentences[j][1]}` + 
                    `${sentences[j][1].includes(',') ? '"' : ''}` + 
                    `${j + 1 == sentences.length ? '\n' : ','}`);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
})
