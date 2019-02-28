import { Injectable } from '@angular/core';
import axios from 'axios';

const twitch_stream = 'https://api.twitch.tv/kraken/streams/'
const twitch_channel = 'https://api.twitch.tv/kraken/channels/'

const bttv_global = 'https://api.betterttv.net/2/emotes';
const bttv_channel = 'https://api.betterttv.net/2/channels/';
const bttv_sizes = ['1x', '2x', '3x']

const ffz_global = 'https://api.frankerfacez.com/v1/set/global';
const ffz_channel = 'https://api.frankerfacez.com/v1/room/';

const badges_channel = 'https://badges.twitch.tv/v1/badges/channels/';
const badges_global = 'https://badges.twitch.tv/v1/badges/global/display';

const twitch_emotes = 'https://api.twitch.tv/kraken/chat/emoticon_images?emotesets='
const tmi_info = 'https://tmi.twitch.tv/group/user/'

const emojiUrl = 'https://unpkg.com/emoji.json/emoji.json';

const cheers = 'https://api.twitch.tv/kraken/bits/actions?channel_id='

/*
    Twitch is Really Dumb For Real and provides RegEx for like 12 emotes which
    is stupidly inefficient because everything else can just check for key existence 
    :-?)
*/
const fixes = {
    "R-?\\)": [
        `R-)`,
        `R)`,
    ],
    "\\:-?(p|P)": [
        `:-p`,
        `:-P`,
        `:P`,
        `:p`,
    ],
    "\\;-?\\)":[
        `;-)`,
        `;)`,
    ],
    "\\:-?[\\\\/]":[
        `:-\\`,
        `:-/`,
        `:\\`,
        `:/`,
    ],
    "\\\u0026lt\\;3":[
        `<3`,
    ],
    "\\:-?(o|O)":[
        `:-o`,
        `:-O`,
        `:o`,
        `:O`,
    ],
    "B-?\\)":[
        `B-)`,
        `B)`,
    ],
    "[oO](_|\\.)[oO]":[
        `o.o`,
        `O.O`,
        `o.O`,
        `O.o`,
        `o_o`,
        `O_O`,
        `o_O`,
        `O_o`,
    ],
    "\\:-?[z|Z|\\|]":[
        `:-z`,
        `:-Z`,
        `:-|`,
        `:z`,
        `:Z`,
        `:|`,
    ],
    "\\\u0026gt\\;\\(":[
        `>(`
    ],
    "\\:-?D":[
        `:-D`,
        `:D`,
    ],
    "\\:-?\\(":[
        `:-(`,
        `:(`,
    ],
    "\\:-?\\)":[
        `:-)`,
        `:)`,
    ],
}


@Injectable({
    providedIn: 'root'
})
export class WebApiService {

    public static badges: Object = {};
    public static ffz: Object = {};
    public static bttv: Object = {};
    public static twitch: Object = {};
    public static cheers: Object = {};
    public static emoji: Object = {};

    constructor() { }

    public static getStream(id, key) {
        return this.get(`${twitch_stream}${id}`, { 
            headers: {
                Authorization : `OAuth ${key}`
            }
        }).then(stream => {
            return stream.stream || {};
        }).catch(err => {});
    }

    public static getChannel(id, key) {
        return this.get(`${twitch_channel}${id}`, { 
            headers: {
                Authorization : `OAuth ${key}`
            }
        }).then(channel => {
            return channel;
        }).catch(err => {});
    }

    public static getUserList(room: string) {
        return this.get(`${tmi_info}${room}/chatters`).then(info => {
            return info.chatters;
        }).catch(err => {});
    }

    public static getEmoji() {
        return this.emoji || this.get(emojiUrl).then(emoji => {
            this.emoji = emoji;
        });
    }

    public static getBttvGlobal(update: boolean = false) {
        return !update && this.bttv['_global'] || this.get(bttv_global).then(global => {
            return this.bttv['_global'] = global.emotes;
        }).catch(err => []);
    }

    public static getBttvRoom(room: string, update: boolean = false) {
        return !update && this.bttv[room] || this.get(`${bttv_channel}${room}`).then(channel => {
            return this.bttv[room] = channel.emotes;
        }).catch(err => []);
    }
    
    public static getBttvEmotes(room: string, update: boolean = false) : Promise<any> {

        const global_promise = this.getBttvGlobal();
        const room_promise = this.getBttvRoom(room);

        return Promise.all([room_promise, global_promise]).then(values => {
            values.forEach(arr => arr.forEach(e => {
                e.src = `https://cdn.betterttv.net/emote/${e.id}/1x`;
                e.type = 'bttv';
             }));
            return values;
        }).catch(err => {
            return [[],[]];
        });
    }

    public static getFFzGlobal(update: boolean = false) : Promise<any> {
        return !update && this.ffz['_global'] || this.get(ffz_global).then(global => {
            return this.ffz['_global'] = global.default_sets.map(n => {
                return global.sets[n].emoticons;
            }).flat();
        }).catch(err => []);
    }

    public static getFFzRoom(room: string, update: boolean = false) : Promise<any> {
        return !update && this.ffz[room] || this.get(`${ffz_channel}${room}`).then(channel => {
            return this.ffz[room] = channel.sets[channel.room.set].emoticons;
        }).catch(err => []);
    }

    public static getFfzEmotes(room: string, update: boolean = false) : Promise<any> {
        
        const global_promise = this.getFFzGlobal(update);
        const room_promise = this.getFFzRoom(room, update);

        return Promise.all([room_promise, global_promise]).then(values => {
            values.forEach(arr => arr.forEach(e => {
                e.code = e.name;
                e.src = `https://cdn.frankerfacez.com/emoticon/${e.id}/1`;
                e.type = 'ffz';
            }));
            return values;
        }).catch(err => {
            return [[],[]];
        });

    }

    public static getTwitchEmoteSets(ids: string[], key: string) {

        const setString = ids.join();
        return this.get(`${twitch_emotes}${setString}`, { 
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
                    
                    if(item.code in fixes) {
                        fixes[item.code].forEach(x => {
                            arr.push(Object.assign({}, item, { code: x }));
                        })
                    } else {
                        arr.push(item);
                    }
                    
                    return arr;
                }, []);
                return this.twitch[id] = [ id, noRegex ];
            });
        });

    }

    public static getTwitchEmotes(sets: string, key: string, update: boolean = false) : Promise<any> {
        
        const needed = [];
        const have = [];

        sets.split(',').forEach(x => {
            if(update || !(x in this.twitch)) {
                needed.push(x);
            } else {
                have.push(this.twitch[x]);
            }
        })

        return this.getTwitchEmoteSets(needed, key).then(newSets => {
            return have.concat(newSets);
        }).catch(err => {
            return have;
        });
    }

    public static getBadges(room: string, update: boolean = false) : Promise<any> {
        
        const room_promise = this.get(`${badges_channel}${room}/display`).then(channel => {
            return channel.badge_sets;
        }).catch(err => {});


        const global_promise = this.get(badges_global).then(global => {
            return global.badge_sets;
        }).catch(err => {});

        return Promise.all([room_promise, global_promise]).then(values => {
            
            Object.keys(values[0]).forEach(x => {
                values[1][x].versions = { ...values[1][x].versions, ...values[0][x].versions };
            });
            
            return this.badges[room] = values[1]
        }).catch(err => {
            return {};
        });
    }

    public static getCheers(room: string, key: string, update: boolean = false) {
        
        return this.get(`${cheers}${room}`, { 
            headers: {
                Accept: 'application/vnd.twitchtv.v5+json',
                Authorization : `OAuth ${key}`
            }
        }).then(cheers => {
            return cheers.actions.reduce((obj, item) => {
                obj[item.prefix.toLowerCase()] = item;
                return obj;
            }, {});
        }).catch(err => {});
    }

    public static get(url: string, config: object = {}) {
        return axios.get(url, config).then((response) => {
            return response.data;
        }).catch(err => {
            throw err;
        });
    }
}
