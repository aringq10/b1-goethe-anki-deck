const fs = require('fs');
const csv = require('csvtojson');
const HTMLParser= require('node-html-parser');
const csvFilePath = `${__dirname}/output.csv`;

csv()
.fromFile(csvFilePath)
.then(async (jsonObj) => {
    let errorCount = 0;
    const stream = fs.createWriteStream(`${__dirname}/sentences.csv`, {flags:'a'});
    const streamLog = fs.createWriteStream(`${__dirname}/log.txt`, {flags:'a'});

    for (let i = 130; i < jsonObj.length; i++) {
        try {
            // Get data
            const response = await fetch(`https://www.linguee.de/deutsch-englisch/uebersetzung/${jsonObj[i].singular}.html`);
            if (response.status != 200) {
                console.log(`Error count: ${errorCount}`);
                console.log(`IRREGULAR STATUS: ${response.status}`);
                console.log(response);
                return;
                
            }

            // Make it HTML
            const buffer = await response.arrayBuffer();
            let decoder = new TextDecoder("iso-8859-15");
            let html = decoder.decode(buffer);

            // Find sentence example blocks
            const root = HTMLParser.parse(html);
            const block = root.querySelectorAll(".translation.sortablemg.featured");
            let sentences = [];
            
            for (let j = 0; j < block.length; j++) {
                // Ensure that definition matches
                const definition = block[j].querySelector(".translation_desc").querySelector(".tag_trans").getElementsByTagName("a")[0].rawText;
                if (!jsonObj[i].translation.includes(definition)) continue;

                // Get sentences for that definition
                if (!block[j].querySelector(".example_lines")) continue; // Check if definition has sentences
                const sentenceAmount = block[j].querySelector(".example_lines").getElementsByTagName("div")[0];
                const germanSentence = sentenceAmount.querySelector(".tag_e").querySelector(".tag_s").rawText;
                const englishSentence = sentenceAmount.querySelector(".tag_e").querySelector(".tag_t").rawText;
                sentences.push([definition, [germanSentence, englishSentence]]);
            }

            // Check if any sentences were found
            if (sentences.length == 0) {
                stream.write(`${jsonObj[i].singular} NOT FOUND\n`);
                streamLog.write(`${i + 1} - ${jsonObj[i].singular} - NOT FOUND\n`);
                continue;
            }

            // Write results to the file
            for (let j = 0; j < sentences.length; j++) {
                stream.write(`"${sentences[j][1][0]}","${sentences[j][1][1]}"${j + 1 == sentences.length ? '' : ','}`);
            }
            stream.write('\n');
            streamLog.write(`${i + 1} - ${jsonObj[i].singular} - ALL GOOD\n`);
        }
        catch (err) {
            errorCount++;
            stream.write(`${jsonObj[i].singular} ERROR\n`);
            streamLog.write(`${i + 1} - ${jsonObj[i].singular} - ERROR\n`);
        }
    }

    console.log(`Error count: ${errorCount}`);
})