const csv = require("csvtojson");
const fs = require("fs");
const HTMLParser= require('node-html-parser');

csv()
    .fromFile(`${__dirname}/verbs.csv`)
    .then(async function(jsonArrayObj){ //when parse finished, result will be emitted here.
        let stream = fs.createWriteStream(`${__dirname}/output.txt`, {flags:'a'});
        // stream.write("first,second,third,fourth,english\n")
        for (let i = 0; i < jsonArrayObj.length; i++) {
            try {
                const res = await fetch(`https://www.verbformen.de/?w=${jsonArrayObj[i].first}`);
                if (res.status == 429) {
                    return console.log("Hit a HTTP 429!!!");
                }
                const data = await res.text();
                
                const root = HTMLParser.parse(data);
                const second = `${root.querySelectorAll(".vTbl")[0].querySelector("table").querySelectorAll("tr")[2].querySelectorAll("td")[1].rawText.replace(/\s+/g, '').replace(/[^A-Za-z/äöüß]/g, '')}${root.querySelectorAll(".vTbl")[0].querySelector("table").querySelectorAll("tr")[2].querySelectorAll("td")[2] ? ' ' + root.querySelectorAll(".vTbl")[0].querySelector("table").querySelectorAll("tr")[2].querySelectorAll("td")[2].rawText.replace(/\s+/g, '').replace(/[^A-Za-z/äöüß]/g, '') : ''}`
                const third = `${root.querySelectorAll(".vTbl")[1].querySelector("table").querySelectorAll("tr")[2].querySelectorAll("td")[1].rawText.replace(/\s+/g, '').replace(/[^A-Za-z/äöüß]/g, '')}${root.querySelectorAll(".vTbl")[1].querySelector("table").querySelectorAll("tr")[2].querySelectorAll("td")[2] ? ' ' + root.querySelectorAll(".vTbl")[1].querySelector("table").querySelectorAll("tr")[2].querySelectorAll("td")[2].rawText.replace(/\s+/g, '').replace(/[^A-Za-z/äöüß]/g, '') : ''}`
                const fourth = root.querySelectorAll(".vTbl")[6].querySelector("table").querySelectorAll("tr")[1].rawText.replace(/\s+/g, '').replace(/[^A-Za-z/äöüß]/g, '');
                
                const string = `${jsonArrayObj[i].first},${second},${third},${fourth},"${jsonArrayObj[i].english}"\n`;
                stream.write(string);
                
                await new Promise(resolve => setTimeout(resolve, 250));
            }
            catch (err) {
                stream.write(`${jsonArrayObj[i].first} !!!\n`);
                console.log(`Probably doesn't exist in database: ${jsonArrayObj[i].first}`);
            }
        }
})