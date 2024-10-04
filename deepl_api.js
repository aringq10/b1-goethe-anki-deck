const fs = require('fs');
const csv = require('csvtojson');
const csvFilePath = `${__dirname}/backup/verbs.csv`;
const deeplKey = process.env.DEEPL_KEY;

// DEEPL
const deepl = require('deepl-node');
const authKey = deeplKey; // Replace with your key
const translator = new deepl.Translator(authKey);

csv()
.fromFile(csvFilePath)
.then(async (jsonObj) => {
    const stream = fs.createWriteStream(`${__dirname}/translated.csv`, {flags:'a'});
    try {
        for (let i = 0; i < jsonObj.length; i++) {
            const sentences = [];
            const result = await translator.translateText(jsonObj[i].german.replace(/\(|\)/g, ""), 'de', 'en-US');
            const englishTranslation = result.text;
            
            for (const [key, value] of Object.entries(jsonObj[i])) {
                if (key == "german" || key == "german_full") continue;
                try {
                const result = await translator.translateText(value, 'de', 'en-US');
                const sentenceTranslation = result.text;
                sentences.push([value, sentenceTranslation]);
                }
                catch (err) {
                    console.log(err);
                }
            }

            stream.write(`${jsonObj[i].german},"${jsonObj[i].german_full}",to ${englishTranslation},`);
            for (let j = 0; j < sentences.length; j++) {
                stream.write(`${sentences[j][0].includes(',') ? '"' : ''}${sentences[j][0]}${sentences[j][0].includes(',') ? '"' : ''},${sentences[j][1].includes(',') ? '"' : ''}${sentences[j][1]}${sentences[j][1].includes(',') ? '"' : ''}${j + 1 == sentences.length ? '\n' : ','}`);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
})
