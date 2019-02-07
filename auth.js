const { BrowserWindow } = require('electron');
const qs = require('querystring');

let auth_window;

module.exports.open_auth_window = function(force_verify) {
    
    const url_params = {
        client_id : 'ut8pnp247zcvfj7gga2lxo8kp2d9lz',
        response_type : 'token',
        redirect_uri : 'http://localhost/cchat',
        scope : 'chat:edit chat:read whispers:edit whispers:read user_subscriptions bits:read',
        force_verify : force_verify || false,
    };


    var promise = new Promise(function(resolve, reject) {
        var success = false;
        auth_window = new BrowserWindow();
        auth_window.on('closed', () => {
            if(!success) {
                reject('Window closed');
            }
            auth_window = null;
        });


        auth_window.webContents.on('will-navigate', (event, url) => {
            console.log(`will-navigate: ${url}`)
            try {
                const auth = parse_oauth(url);
                resolve(auth);
                success = true;
            } 
            catch(err) {
                reject("The response token was not valid.");
            }

            auth_window.destroy();
        });

        auth_window.webContents.on('redirect', (event, url) => {
            console.log(`will-redirect: ${url}`)
            const auth = parse_oauth(url);
            resolve(auth);
            success = true;
            auth_window.destroy();
        })

        auth_window.loadURL('https://id.twitch.tv/oauth2/authorize?' + qs.stringify(url_params));
    });

    promise.then(auth_success, auth_failure);
}


function parse_oauth(url) {
    const regex = /[#&](?<name>[^=]*)=(?<value>[^#&]*)/g;
    var match;
    var matches = {};

    while((match = RegExp(regex).exec(url)) != null) {
        matches[match.groups.name] = match.groups.value;
    }

    return matches;
}


function auth_failure(reason) {
    console.log(`Unable to authenticate Twitch Account: ${reason}`);
}

function auth_success(token) {
    console.log(token);
}
