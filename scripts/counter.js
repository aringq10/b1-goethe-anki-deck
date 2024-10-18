const csv = require('csvtojson');
const keys = ["german", "s1", "s2","s3", "s4","s5", "s6","s7", "s8","s9", "s10",];

csv()
.fromFile(`${__dirname}/../data/og_order/complete_list.csv`)
.then(async (jsonObj) => {
    let sentences = 0;
    let characters = 0;
    for (let i = 0; i < jsonObj.length; i++) {
        for (const [key, value] of Object.entries(jsonObj[i])) {
            if (!keys.includes(key)) continue;
            else if (!value) break;
            if (key != "german") sentences++;
            characters += value.length;
        }
    }
    console.log(`sentences: ${sentences}\ncharacters: ${characters}`);
})