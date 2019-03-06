/*
    Blink, a chat client for Twitch
    Copyright (C) 2019 cairthenn

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { BrowserWindow } = require('electron');
const qs = require('querystring');
const axios = require('axios');
const crypto = require('crypto');

const authUrl = 'https://id.twitch.tv/oauth2/authorize';
const validateUrl = 'https://id.twitch.tv/oauth2/validate';
const redirectSuccess = 'https://cairthenn.com';
const clientId = 'ut8pnp247zcvfj7gga2lxo8kp2d9lz';

let authWindow;

module.exports.getLogin = function(forceVerify) {
    const state = crypto.randomBytes(30).toString('hex');
    const urlParams = {
        client_id: clientId,
        response_type: 'token',
        redirect_uri: 'https://cairthenn.com',
        scope: 'chat:edit chat:read whispers:edit whispers:read channel:moderate whispers:edit',
        force_verify: forceVerify || false,
        state: state,
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
                if(auth.state !== state) {
                    reject('The response token was not valid.');
                    return;
                }
                resolve(auth);
                success = true;
            }
            catch(err) {
                reject('The response token was not valid.');
            }
            authWindow.destroy();
        });

        authWindow.loadURL(`${authUrl}?${qs.stringify(urlParams)}`);
        // authWindow.webContents.toggleDevTools();
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