const { BrowserWindow, ipcMain } = require('electron');
const qs = require('querystring');
const axios = require('axios');
const auth_url = 'https://id.twitch.tv/oauth2/authorize';
const validate_url = 'https://id.twitch.tv/oauth2/validate';
const client_id = 'ut8pnp247zcvfj7gga2lxo8kp2d9lz';

let auth_window;

module.exports.get_login = function(force_verify) {
    
    const url_params = {
        client_id : client_id,
        response_type : 'token',
        redirect_uri : 'https://cairthenn.com',
        scope : 'chat:edit chat:read whispers:edit whispers:read user_subscriptions',
        force_verify : force_verify || false,
    };

    var promise = new Promise(function(resolve, reject) {
        var success = false;
        auth_window = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: false
            },
            autoHideMenuBar: true,
        });

        auth_window.on('ready-to-show', () => auth_window.show());

        // Cleaner cancel
        auth_window.webContents.on('did-frame-navigate', (event, url) => {
            if(url == auth_url) {
                reject('Authorization was canceled.');
                auth_window.destroy();
            }
        });

        auth_window.on('closed', () => {
            if(!success) {
                reject('The window was closed.');
            }
            auth_window = null;
        });

        auth_window.webContents.on('will-redirect', (event, url) => {
            try {
                const auth = parse_oauth(url);
                resolve(auth);
                success = true;
            } 
            catch(err) {
                reject('The response token was not valid.');
            }
            auth_window.destroy();
        });

        auth_window.loadURL(`${auth_url}?${qs.stringify(url_params)}`);
    });

    return promise.then(auth => {
        return validate_username(auth.access_token).then(user => {
            return { user: user, token: auth.access_token };
        })
    }).catch(err => {
        throw err;
    });
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

function validate_username(token) {
    return axios.get(validate_url, { 
        headers: {
            Authorization : `OAuth ${token}`
        }
    }).then((response) => {
        return response.data.login;
    }).catch(err => {
        throw err;
    });
}