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

import axios from 'axios';

const twitchStreamUrl = 'https://api.twitch.tv/kraken/streams/';
const twitchChannelUrl = 'https://api.twitch.tv/kraken/channels/';

const bttvGlobalUrl = 'https://api.betterttv.net/2/emotes';
const bttvChannelUrl = 'https://api.betterttv.net/2/channels/';

const ffzGlobalUrl = 'https://api.frankerfacez.com/v1/set/global';
const ffzChannelUrl = 'https://api.frankerfacez.com/v1/room/';

const badgeChannelUrl = 'https://badges.twitch.tv/v1/badges/channels/';
const badgeGlobalUrl = 'https://badges.twitch.tv/v1/badges/global/display';

const twitchEmotesUrl = 'https://api.twitch.tv/kraken/chat/emoticon_images?emotesets=';
const tmiInfo = 'https://tmi.twitch.tv/group/user/';

const emojiUrl = 'https://unpkg.com/emoji.json/emoji.json';

const cheersUrl = 'https://api.twitch.tv/kraken/bits/actions?channel_id=';

/*
    Twitch is Really Dumb For Real and provides RegEx for like 12 emotes which
    is stupidly inefficient because everything else can just check for key existence
    :-?)
*/
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
export class WebApiService {

    public static badges: any = {};
    public static ffz: any = {};
    public static bttv: any = {};
    public static twitch: any = {};
    public static cheers: any = {};
    public static emoji: any = {
        lookup: {},
        autocomplete: [],
    };

    public static getStream(id, key) {
        return this.get(`${twitchStreamUrl}${id}`, {
            headers: {
                Authorization : `OAuth ${key}`
            }
        }).then(stream => {
            return stream.stream || {};
        });
    }

    public static getChannel(id, key) {
        return this.get(`${twitchChannelUrl}${id}`, {
            headers: {
                Authorization : `OAuth ${key}`
            }
        }).then(channel => {
            return channel;
        });
    }

    public static getUserList(room: string) {
        return this.get(`${tmiInfo}${room}/chatters`).then(info => {
            return info.chatters;
        });
    }

    public static getEmoji() {
        return new Promise((resolve, reject) => {
            if(this.emoji.lookup) {
                resolve(this.emoji);
            }
            this.get(emojiUrl).then(emoji => {
                
                emoji.forEach(e => {
                    if(e.keywords === 'flag') {
                        return;
                    }

                    const name = e.name.replace(/[:"'_-]/,'').replace(' ', '_').toLowerCase();
                    const emojiShortcut = `:${name}:`;
                    e.emoji = true;
                    e.shortcut = emojiShortcut;
                    e.lower = name;
                    this.emoji.lookup[emojiShortcut] = e;
                    this.emoji.autocomplete.push([emojiShortcut, e.char]);
                });
                resolve(this.emoji);
            }).catch(err => console.log(err));
        });
    }

    public static getBttvGlobal(update: boolean = false) {
        return !update && this.bttv._global || this.get(bttvGlobalUrl).then(global => {
            return this.bttv._global = global.emotes;
        });
    }

    public static getBttvRoom(room: string, update: boolean = false) {
        return !update && this.bttv[room] || this.get(`${bttvChannelUrl}${room}`).then(channel => {
            return this.bttv[room] = channel.emotes;
        });
    }

    public static getBttvEmotes(room: string, update: boolean = false): Promise<any> {

        const globalPromise = this.getBttvGlobal();
        const roomPromise = this.getBttvRoom(room);

        return Promise.all([roomPromise, globalPromise]).then(values => {
            values.forEach(arr => arr.forEach(e => {
                e.src = `https://cdn.betterttv.net/emote/${e.id}/1x`;
                e.type = 'bttv';
                e.lower = e.code.toLowerCase();
             }));
            return values;
        });
    }

    public static getFFzGlobal(update: boolean = false): Promise<any> {
        return !update && this.ffz._global || this.get(ffzGlobalUrl).then(global => {
            return this.ffz._global = global.default_sets.map(n => {
                return global.sets[n].emoticons;
            }).flat();
        });
    }

    public static getFFzRoom(room: string, update: boolean = false): Promise<any> {
        return !update && this.ffz[room] || this.get(`${ffzChannelUrl}${room}`).then(channel => {
            return this.ffz[room] = channel.sets[channel.room.set].emoticons;
        });
    }

    public static getFfzEmotes(room: string, update: boolean = false): Promise<any> {

        const globalPromise = this.getFFzGlobal(update);
        const roomPromise = this.getFFzRoom(room, update);

        return Promise.all([roomPromise, globalPromise]).then(values => {
            values.forEach(arr => arr.forEach(e => {
                e.code = e.name;
                e.src = `https://cdn.frankerfacez.com/emoticon/${e.id}/1`;
                e.type = 'ffz';
                e.lower = e.code.toLowerCase();
            }));
            return values;
        });
    }

    public static getTwitchEmoteSets(ids: string[], key: string) {
        const setString = ids.join();
        return this.get(`${twitchEmotesUrl}${setString}`, {
            headers: {
                Authorization : `OAuth ${key}`
            }
        }).then(emotes => {
            return ids.map(id => {
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
                return this.twitch[id] = [ id, noRegex ];
            });
        });

    }

    public static getTwitchEmotes(sets: string, key: string, update: boolean = false): Promise<any> {

        const needed = [];
        const have = [];

        sets.split(',').forEach(x => {
            if (update || !(x in this.twitch)) {
                needed.push(x);
            } else {
                have.push(this.twitch[x]);
            }
        });

        return this.getTwitchEmoteSets(needed, key).then(newSets => {
            return have.concat(newSets);
        });
    }

    public static getBadges(room: string, update: boolean = false): Promise<any> {

        const roomPromise = this.get(`${badgeChannelUrl}${room}/display`).then(channel => {
            return channel.badge_sets;
        });


        const globalPromise = this.get(badgeGlobalUrl).then(global => {
            return global.badge_sets;
        });

        return Promise.all([roomPromise, globalPromise]).then(values => {

            Object.keys(values[0]).forEach(x => {
                values[1][x].versions = { ...values[1][x].versions, ...values[0][x].versions };
            });

            return this.badges[room] = values[1];
        });
    }

    public static getCheers(room: string, key: string, update: boolean = false) {

        return this.get(`${cheersUrl}${room}`, {
            headers: {
                Accept: 'application/vnd.twitchtv.v5+json',
                Authorization : `OAuth ${key}`
            }
        }).then(cheers => {
            return cheers.actions.reduce((obj, item) => {
                obj[item.prefix.toLowerCase()] = item;
                return obj;
            }, {});
        });
    }

    public static get(url: string, config: any = {}) {
        return axios.get(url, config).then((response) => {
            return response.data;
        }).catch(err => {
            throw err;
        });
    }
}
