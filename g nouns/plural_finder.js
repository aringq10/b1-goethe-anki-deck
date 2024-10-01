const csvFilePath = `${__dirname}/noun_all.csv`;
const csv = require('csvtojson');
const fs = require('fs');

csv()
.fromFile(csvFilePath)
.then((jsonObj)=>{
    const stream = fs.createWriteStream(`${__dirname}/output.txt`, {flags:'a'});
    for (let i = 0; i < jsonObj.length; i++) {
        let formattedPlural;
        const singular = jsonObj[i].singular.toLowerCase();
        const plural = jsonObj[i].plural.slice(4).toLowerCase();

        if (singular == plural) {
            formattedPlural = "-";
        }
        else if (!plural) {
            formattedPlural = jsonObj[i].article != "die" ? "Sg." : "Pl.";
        }
        else if (plural.includes(singular)) {
            formattedPlural = `-${plural.slice(singular.length)}`;
        }
        else if (plural.includes('ä') && plural.indexOf('ä') != singular.indexOf('ä')) {
            formattedPlural = `-"${plural.slice(singular.length)}`;
        }
        else if (plural.includes('ö') && plural.indexOf('ö') != singular.indexOf('ö')) {
            formattedPlural = `-"${plural.slice(singular.length)}`;
        }
        else if (plural.includes('ü') && plural.indexOf('ü') != singular.indexOf('ü')) {
            formattedPlural = `-"${plural.slice(singular.length)}`;
        }
        else {
            formattedPlural = jsonObj[i].plural;
        }

        const output = `${jsonObj[i].article},${jsonObj[i].singular},${formattedPlural},${jsonObj[i].translation.includes(',') ? `"${jsonObj[i].translation}"` : jsonObj[i].translation}\n`;
        stream.write(output);
    }
})