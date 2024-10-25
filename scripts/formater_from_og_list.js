const fs = require('fs');
const csv = require('csvtojson');
const csvFilePath = `${__dirname}/data/goethe-zertifikat-b1-wortliste.csv`;

csv()
.fromFile(csvFilePath)
.then(async (jsonObj) => {
    // Counters and output streams
    let characterCount = 0;
    let counts = [0, 0, 0];
    const nounStream = fs.createWriteStream(`${__dirname}/nouns.csv`, {flags:'a'});
    const verbStream = fs.createWriteStream(`${__dirname}/verbs.csv`, {flags:'a'});
    const otherStream = fs.createWriteStream(`${__dirname}/other.csv`, {flags:'a'});

    for (let i = 0; i < jsonObj.length; i++) {
        // Format sentences
        jsonObj[i].sentences = jsonObj[i].sentences.split('\n');
        // if (jsonObj[i].sentences.length > 7) console.log(jsonObj[i].word);
        try {
            // Categorize and format words
            const word = jsonObj[i].word;
            // NOUN
            if (word.slice(0, 4) == "der " || word.slice(0, 4) == "die " || word.slice(0, 4) == "das ") {
                let output = "";
                // Format noun
                if (word.includes('\n')) {
                    output += `EDIT,${word.includes(',') ? '"' : ''}${word.replace(/\n/g, ' ')}${word.includes(',') ? '"' : ''},`;
                }
                else if (word.includes(',')){
                    const actualWord = word.slice(4, word.indexOf(','));
                    output += `${actualWord},"${word}",`;
                }
                else {
                    const actualWord = word.slice(4, word.length + 1);
                    output += `${actualWord},${word},`;
                }

                // Format sentences
                if (jsonObj[i].sentences.length == 1) {
                    const comma = jsonObj[i].sentences[0].includes(',');
                    output += `${comma ? '"' : ''}${jsonObj[i].sentences[0]}${comma ? '"' : ''}\n`;
                    characterCount += jsonObj[i].sentences[0].length;
                }
                else {
                    for (let j = 0; j < jsonObj[i].sentences.length; j++) {
                        const comma = jsonObj[i].sentences[j].includes(',');
                        output += `${comma ? '"' : ''}${jsonObj[i].sentences[j].slice(3)}${comma ? '"' : ''}${j + 1 == jsonObj[i].sentences.length ? '\n' : ','}`;
                        characterCount += jsonObj[i].sentences[j].length;
                    }
                }
                nounStream.write(output);
                counts[0]++;
            }
            // VERB
            else if ((word.match(/,/g) || []).length == 3) {
                let output = "";
                // Format verb
                output += `${word.slice(0, word.indexOf(','))},"${word}",`;
                // Format sentences
                if (jsonObj[i].sentences.length == 1) {
                    const comma = jsonObj[i].sentences[0].includes(',');
                    output += `${comma ? '"' : ''}${jsonObj[i].sentences[0]}${comma ? '"' : ''}\n`;
                    characterCount += jsonObj[i].sentences[0].length;
                }
                else {
                    for (let j = 0; j < jsonObj[i].sentences.length; j++) {
                        const comma = jsonObj[i].sentences[j].includes(',');
                        output += `${comma ? '"' : ''}${jsonObj[i].sentences[j].slice(3)}${comma ? '"' : ''}${j + 1 == jsonObj[i].sentences.length ? '\n' : ','}`;
                        characterCount += jsonObj[i].sentences[j].length;
                    }
                }
                verbStream.write(output);
                counts[1]++;
            }
            // ADJECTIVES, ADVERBS, PREPOSITIONS
            else {
                if(word[0] == word[0].toUpperCase()) {
                    console.log(word);
                }
                
                let output = "";
                // Format other
                output += `${word.includes(',') ? '"' : ''}${word}${word.includes(',') ? '"' : ''},${word.includes(',') ? '"' : ''}${word}${word.includes(',') ? '"' : ''},`;
                // Format sentences
                if (jsonObj[i].sentences.length == 1) {
                    const comma = jsonObj[i].sentences[0].includes(',');
                    output += `${comma ? '"' : ''}${jsonObj[i].sentences[0]}${comma ? '"' : ''}\n`;
                    characterCount += jsonObj[i].sentences[0].length;
                }
                else {
                    for (let j = 0; j < jsonObj[i].sentences.length; j++) {
                        const comma = jsonObj[i].sentences[j].includes(',');
                        output += `${comma ? '"' : ''}${jsonObj[i].sentences[j].slice(3)}${comma ? '"' : ''}${j + 1 == jsonObj[i].sentences.length ? '\n' : ','}`;
                        characterCount += jsonObj[i].sentences[j].length;
                    }
                }
                otherStream.write(output);
                counts[2]++;
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    // Print count results
    const total = counts[0] + counts[1] + counts[2];
    console.log(`total words: ${total}\ntotal characters: ${characterCount}`);    
    console.log(`nouns: ${counts[0]} ${(counts[0] / total).toFixed(2)}\nverbs: ${counts[1]} ${(counts[1] / total).toFixed(2)}\nother: ${counts[2]} ${(counts[2] / total).toFixed(2)}`);
})
