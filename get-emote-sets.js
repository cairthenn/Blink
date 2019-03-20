const axios = require('axios');
const fs = require('fs');
/*
    Writes the real twitch emote sets to the assets folder.
*/
axios.get('https://twitchemotes.com/api_cache/v3/sets.json').then(response => {
    fs.writeFile('./src/assets/emote-sets.json', JSON.stringify(response.data), 'utf-8', (err) => {
        if(err) {
            console.log(`Unable to process set names: ${err}`);
            return -1;
        }
        console.log('Downloaded emote set info!');
    })
}).catch(err => {
    console.log(`Unable to download set names: ${err}`);
    return -1;
});