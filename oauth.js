const { BrowserWindow } = require('electron');
const qs = require('querystring');
const axios = require('axios');

const authUrl = 'https://id.twitch.tv/oauth2/authorize';
const validateUrl = 'https://id.twitch.tv/oauth2/validate';
const redirectSuccess = 'https://cairthenn.com';
const clientId = 'ut8pnp247zcvfj7gga2lxo8kp2d9lz';

let authWindow;

module.exports.getLogin = function(forceVerify) {
    
    const urlParams = {
        client_id: clientId,
        response_type: 'token',
        redirect_uri: 'https://cairthenn.com',
        scope: 'chat:edit chat:read whispers:edit whispers:read channel:moderate whispers:edit',
        force_verify: forceVerify || false,
    };

    var promise = new Promise(function(resolve, reject) {
        var success = false;
        authWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: false
            },
            autoHideMenuBar: true,
        });

        authWindow.on('ready-to-show', () => authWindow.show());

        // Cleaner cancel
        authWindow.webContents.on('did-frame-navigate', (event, url) => {
            if(url == authUrl) {
                reject('Authorization was canceled.');
                authWindow.destroy();
            }
        });

        authWindow.on('closed', () => {
            if(!success) {
                reject('The window was closed.');
            }
            authWindow = null;
        });

        authWindow.webContents.on('will-redirect', (event, url) => {
            
            if(url.indexOf(redirectSuccess) != 0) {
                return;
            }

            try {
                const auth = parseOauth(url);
                resolve(auth);
                success = true;
            } 
            catch(err) {
                reject('The response token was not valid.');
            }
            authWindow.destroy();
        });

        authWindow.loadURL(`${authUrl}?${qs.stringify(urlParams)}`);
    });

    return promise.then(auth => {
        return validateUsername(auth.access_token).then(user => {
            return { user: user, token: auth.access_token };
        })
    }).catch(err => {
        throw err;
    });
}

function parseOauth(url) {
    const regex = /[#&](?<name>[^=]*)=(?<value>[^#&]*)/g;
    var match;
    var matches = {};

    while((match = RegExp(regex).exec(url)) != null) {
        matches[match.groups.name] = match.groups.value;
    }

    return matches;
}

function validateUsername(token) {
    return axios.get(validateUrl, { 
        headers: {
            Authorization : `OAuth ${token}`
        }
    }).then((response) => {
        return response.data.login;
    }).catch(err => {
        throw err;
    });
}