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


    public static getBttvGlobal() {
        return this.get(bttv_global).then(global => {
            return this.bttv['_global'] = global.emotes.reduce((obj, item) => {
                obj[item.code] = item;
                return obj;
            }, {});
        }).catch(err => {});
    }

    public static getBttvRoom(room: string) {
        return this.bttv[room] || this.get(`${bttv_channel}${room}`).then(channel => {
            return this.bttv[room] = channel.emotes.reduce((obj, item) => {
                obj[item.code] = item;
                return obj;
            }, {});
        }).catch(err => {});
    }
    
    public static getBttvEmotes(room: string, update: boolean = false) : Promise<any> {

        const global_promise = this.getBttvGlobal();
        const room_promise = this.getBttvRoom(room);

        return Promise.all([room_promise, global_promise]).then(values => {
            return { ...values[0], ...values[1] };
        }).catch(err => {
            return {};
        });
    }

    public static getFFzGlobal() : Promise<any> {
        return this.ffz['_global'] || this.get(ffz_global).then(global => {
            return this.ffz['_global'] = global.default_sets.map(n => {
                return global.sets[n].emoticons;
            }).flat().reduce((obj, item) => {
                obj[item.name] = item;
                return obj;
            }, {});
        }).catch(err => {});
    }

    public static getFFzRoom(room: string) : Promise<any> {
        return this.ffz[room] || this.get(`${ffz_channel}${room}`).then(channel => {
            return this.ffz[room] = channel.sets[channel.room.set].emoticons.reduce((obj, item) => {
                obj[item.name] = item;
                return obj;
            }, {});
        }).catch(err => {});
    }

    public static getFfzEmotes(room: string, update: boolean = false) : Promise<any> {
        
        const global_promise = this.getFFzGlobal();
        const room_promise = this.getFFzRoom(room);

        return Promise.all([room_promise, global_promise]).then(values => {
            return { ...values[0], ...values[1] };
        }).catch(err => {
            return {};
        });

    }

    public static getTwitchEmotes(sets: string, key: string, update: boolean = false) : Promise<any> {

        const promises = sets.split(',').map(id => {
            return id in this.twitch ? this.twitch[id] : this.get(`${twitch_emotes}${id}`, { 
                headers: {
                    Authorization : `OAuth ${key}`
                }
            }).then(emotes => {
                return this.twitch[id] = emotes.emoticon_sets[id];
            });
        });

        return Promise.all(promises).then((results: any) => {
            return results.flat().reduce(function(obj, item) {
                if(item.code in fixes) {
                    fixes[item.code].forEach(element => {
                        obj[element] = item;
                    });
                } else {
                    obj[item.code] = item;
                }
                return obj;
            }, {});
        }).catch(err => {
            return {};
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

    public static getCheers(room: string, update: boolean = false) {
        
    }

    public static get(url: string, config: object = {}) {
        return axios.get(url, config).then((response) => {
            return response.data;
        }).catch(err => {
            throw err;
        });
    }
}
