const { net } = require('Electron');

const base_url = 'https://api.twitch.tv/kraken'

module.exports.verify_token = function(token) {
    const request = net.request({
        url: base_url + `?token=${token}`,
    });

    request.on('response', (response) => {
        response.on('data', (data) => {
            console.log(data);
        });
    });

    request.end();
}