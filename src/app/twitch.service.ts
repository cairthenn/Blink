import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { IrcService } from './irc.service';
import CryptoJS from 'crypto-js';
import * as qs from 'querystring';
import { Web } from './web';

const authBase = 'https://id.twitch.tv/oauth2';
const authUrl = `${authBase}/authorize`;
const validateUrl = `${authBase}/validate`;
const revokeUrl = `${authBase}/revoke`;
const redirect = 'https://cairthenn.com';
const scopes = 'chat:edit chat:read whispers:edit whispers:read channel:moderate user_subscriptions';
const clientId = 'ut8pnp247zcvfj7gga2lxo8kp2d9lz';

const badgeChannelUrl = 'https://badges.twitch.tv/v1/badges/channels/';
const badgeGlobalUrl = 'https://badges.twitch.tv/v1/badges/global/display';
const emoteSetUrl = 'https://api.twitchemotes.com/api/v4/sets'

const tmiInfo = 'https://tmi.twitch.tv/group/user/';
const twitchApi = 'https://api.twitch.tv';
const apiVersion = 'kraken';
const cheersEp = 'bits/actions';
const streamEp = 'streams';
const channelEp = 'channels';
const oauthRegex = /[#&]([^=]*)=([^#&]*)/g;
const fixes = {
    'R-?\\)': [
        `R-)`,
        `R)`,
    ],
    '\\:-?(p|P)': [
        `:-p`,
        `:-P`,
        `:P`,
        `:p`,
    ],
    '\\;-?(p|P)': [
        `;-p`,
        `;-P`,
        `;P`,
        `;p`,
    ],
    '\\;-?\\)': [
        `;-)`,
        `;)`,
    ],
    '\\:-?[\\\\/]': [
        `:-\\`,
        `:-/`,
        `:\\`,
        `:/`,
    ],
    '\\\u0026lt\\;3': [
        `<3`,
    ],
    '\\:-?(o|O)': [
        `:-o`,
        `:-O`,
        `:o`,
        `:O`,
    ],
    'B-?\\)': [
        `B-)`,
        `B)`,
    ],
    '[oO](_|\\.)[oO]': [
        `o.o`,
        `O.O`,
        `o.O`,
        `O.o`,
        `o_o`,
        `O_O`,
        `o_O`,
        `O_o`,
    ],
    '\\:-?[z|Z|\\|]': [
        `:-z`,
        `:-Z`,
        `:-|`,
        `:z`,
        `:Z`,
        `:|`,
    ],
    '\\\u0026gt\\;\\(': [
        `>(`
    ],
    '\\:-?D': [
        `:-D`,
        `:D`,
    ],
    '\\:-?\\(': [
        `:-(`,
        `:(`,
    ],
    '\\:-?\\)': [
        `:-)`,
        `:)`,
    ],
};

@Injectable({
    providedIn: 'root'
})
export class TwitchService {

    public username: string;
    public usernameLower: string;

    private authWindow;
    private cheers: any = {};
    private streams: any = {};
    private channels: any = {};
    private badges: any = {};
    private emotes: any = {};
    private setNames: any = {};
    private validation: any = {};
    private enckey: string;
    private loggedIn: boolean;
    private emoteCheck: number;

    private updates: any = {
        emotes: 600000,
        badges: 600000,
        users: 60000,
        streams: 60000,
    };

    constructor(public irc: IrcService) { }

    public needsUpdate(lastupdate, type) {
        if (!lastupdate) {
            return true;
        }
        return Date.now() - lastupdate >= (this.updates[type] || 0);
    }

    public sendMessage(channel: string, message: string) {
        this.irc.sendMessage(channel, message);
    }

    public join(channel: string, callbacks: any) {
        this.irc.join(channel, callbacks);
    }

    public part(channel: string) {
        this.irc.part(channel);
    }

    public logout() {
        return Web.post(`${revokeUrl}?client_id=${clientId}&token=${this.key}`).then(success => {
            if (success) {
                this.loggedIn = false;
                this.enckey = undefined;
                this.username = undefined;
                this.usernameLower = undefined;
                this.irc.disconnect();
                return true;
            }
            return false;
        });

    }

    public login(forceVerify: boolean) {

        const random = ElectronService.crypto.randomBytes(30).toString('hex');
        const urlParams = {
            client_id: clientId,
            redirect_uri: redirect,
            response_type: 'token',
            scope: scopes,
            force_verify: forceVerify || false,
            state: random,
        };

        const promise = new Promise((resolve, reject) => {
            let success = false;
            this.authWindow = new ElectronService.remote.BrowserWindow({
                show: false,
                webPrefereces: {
                    nodeIntegration: false,
                },
                autoHideMenuBar: true,
            });


            this.authWindow.on('ready-to-show', () => this.authWindow.show());

            // Cleaner cancel
            this.authWindow.webContents.on('did-frame-navigate', (event, url) => {
                if (url === authUrl) {
                    reject('Authorization was canceled.');
                    this.authWindow.destroy();
                }
            });

            this.authWindow.on('closed', () => {
                if (!success) {
                    reject('The window was closed.');
                }
                this.authWindow = null;
            });

            this.authWindow.webContents.on('will-redirect', (event, url) => {

                if (url.indexOf(redirect) !== 0) {
                    return;
                }

                try {
                    const auth = this.parseOauth(url);
                    if (auth.state !== random) {
                        reject('The response token was not valid.');
                        return;
                    }
                    resolve(auth);
                    success = true;
                } catch (err) {
                    reject('The response token was not valid.');
                }
                this.authWindow.destroy();
            });

            this.authWindow.loadURL(`${authUrl}?${qs.stringify(urlParams)}`);
        });

        return promise.then((auth: any) => {
            return Web.get(validateUrl, {
                headers: {
                    Authorization : `OAuth ${auth.access_token}`
                }
            }).then(validatation => {
                this.validation = validatation;
                this.username = validatation.login;
                this.usernameLower = validatation.login.toLowerCase();
                this.enckey = CryptoJS.AES.encrypt(auth.access_token, validatation.login);
                this.loggedIn = true;
                return this.irc.connect(validatation.login, auth.access_token).then(() => {
                    return this.getEmotes().then(() => {
                        return true;
                    });
                }).catch(err => false);
            });
        }).catch(err => false);
    }

    public getStream(id: string, update?: boolean) {
        const fetch = update || this.streams[id] ? this.needsUpdate(this.streams[id][1], 'streams') : true;
        if (!fetch) {
            return Promise.resolve(this.streams[id][0]);
        }

        return Web.get(`${twitchApi}/${apiVersion}/${streamEp}/${id}`, {
            headers: {
                Authorization : `OAuth ${this.key}`
            }
        }).then(stream => {
            const info = stream.stream || {};
            info.live = info.stream_type === 'live';
            info.vod = info.stream_type === 'playlist';
            this.streams[id] = [ info, Date.now() ];
            return info;
        });
    }

    public getChannel(id: string, update?: boolean) {

        const fetch = update || this.channels[id] ? this.needsUpdate(this.channels[id][1], 'channels') : true;
        if (!fetch) {
            return Promise.resolve(this.channels[id][0]);
        }

        return Web.get(`${twitchApi}/${apiVersion}/${channelEp}/${id}`, {
            headers: {
                Authorization : `OAuth ${this.key}`
            }
        }).then(channel => {
            channel.signup = new Date(channel.created_at).toDateString();
            this.channels[id] = [ channel, Date.now() ];
            return channel;
        });
    }

    public getBadges(room: string, update: boolean = false): Promise<any> {

        const fetch = update || this.badges[room] ? this.needsUpdate(this.badges[room][1], 'badges') : true;
        if (!fetch) {
            return Promise.resolve(this.badges[room][0]);
        }

        const roomPromise = Web.get(`${badgeChannelUrl}${room}/display`).then(channel => {
            return channel.badge_sets;
        });


        const globalPromise = Web.get(badgeGlobalUrl).then(global => {
            return global.badge_sets;
        });

        return Promise.all([roomPromise, globalPromise]).then(values => {

            Object.keys(values[0]).forEach(x => {
                values[1][x].versions = { ...values[1][x].versions, ...values[0][x].versions };
            });
            this.badges[room] = [ values[1], Date.now() ];
            return values[1];
        });
    }

    public getEmoteSets(sets: string[]) {
        return Web.get(`${emoteSetUrl}?id=${sets.join()}`).then(results => {
            return results.reduce((obj, item) => {
                obj[item.set_id] = item;
                return obj;
            }, this.setNames);
        }).catch(err => {
            console.log(err);
            return {};
        });
    }

    public getEmotes(update?: boolean) {

        const fetch = update || this.emotes ? this.needsUpdate(this.emoteCheck, 'emotes') : true;
        if (!fetch) {
            return Promise.resolve(this.emotes);
        }

        return Web.get(`${twitchApi}/${apiVersion}/users/${this.username}/emotes`, {
            headers: {
                Authorization : `OAuth ${this.key}`
            }
        }).then(emotes => {
            const keys = Object.keys(emotes.emoticon_sets);
            return this.getEmoteSets(keys).then((sets) => {
                console.log(sets);
                this.emotes.sets = keys.map(id => {
                    const set = emotes.emoticon_sets[id];
                    const noRegex = set.reduce((arr, item) => {
                        item.userOnly = true;
                        item.type = 'twitch';
                        item.src = `https://static-cdn.jtvnw.net/emoticons/v1/${item.id}/1.0`;
                        item.lower = item.code.toLowerCase();
    
                        if (item.code in fixes) {
                            fixes[item.code].forEach(x => {
                                arr.push(Object.assign({}, item, { code: x }));
                            });
                        } else {
                            arr.push(item);
                        }
    
                        return arr;
                    }, []);
                    const setInfo = sets[id] || {
                        set_id: id,
                        channel_name: `Unknown Set ${id}`,
                        channel_id: '0',
                        tier: 0,
                    };
                    return [ setInfo, noRegex ];
                });
                this.emotes.lookup = this.emotes.sets.reduce((obj, arr) => {
                    arr[1].forEach(e => {
                        obj[e.code] = e;
                    });
                    return obj;
                }, {});
                this.emoteCheck = Date.now();
                return this.emotes;
            });
        });

    }

    public getCheers(room: string, update: boolean = false) {

        const fetch = update || this.cheers[room] ? this.needsUpdate(this.cheers[room][1], 'cheer') : true;
        if (!fetch) {
            return Promise.resolve(this.cheers[room][0]);
        }

        return Web.get(`${twitchApi}/${apiVersion}/${cheersEp}?channel_id=${room}`, {
            headers: {
                Accept: 'application/vnd.twitchtv.v5+json',
                Authorization : `OAuth ${this.key}`
            }
        }).then(cheers => {
            const results = cheers.actions.reduce((obj, item) => {
                obj[item.prefix.toLowerCase()] = item;
                return obj;
            }, {});
            this.cheers[room] = [ results, Date.now() ];
            return results;
        });
    }

    public getUserList(room: string) {
        return Web.get(`${tmiInfo}${room}/chatters`).then(info => {
            return info.chatters;
        });
    }

    private parseOauth(url): any {
        const matches = {};
        let match = oauthRegex.exec(url);

        while (match) {
            matches[match[1]] = match[2];
            match = oauthRegex.exec(url);
        }
        return matches;
    }

    private get key() {
        const bytes = CryptoJS.AES.decrypt(this.enckey, this.username);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}
