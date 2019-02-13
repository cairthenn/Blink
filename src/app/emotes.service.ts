import { Injectable } from '@angular/core';
import axios from 'axios';
import _ from 'lodash';

const bttv_global = "https://api.betterttv.net/2/emotes";
const bttv_channel = "https://api.betterttv.net/2/channels/";
const bbtv_emote = "https://cdn.betterttv.net/emote/";
const bttv_sizes = ['1x', '2x', '3x']

const ffz_global = "https://api.frankerfacez.com/v1/set/global";
const ffz_channel = "https://api.frankerfacez.com/v1/room/";

const badges_channel = "https://badges.twitch.tv/v1/badges/channels/";
const badges_global = "https://badges.twitch.tv/v1/badges/global/display";



@Injectable({
    providedIn: 'root'
})
export class EmotesService {

    public static badges: Object = {};
    public static ffz: Object = {};
    public static bttv: Object = {};
    public static twitch: Object = {};
    public static cheers: Object = {};

    constructor() { }

    public static getBttvEmotes(room: string, update: boolean = false) : Promise<any> {

        return this.get(`${bttv_channel}${room}`).then(channel => {
            
            this.bttv[room] = channel.emotes.reduce((obj, item) => {
                obj[item.code] = item;
                return obj;
            }, {});

            return this.get(bttv_global).then(global => {
                this.bttv['_global'] = global.emotes.reduce((obj, item) => {
                    obj[item.code] = item;
                    return obj;
                }, {});
                
                return { ...this.bttv['_global'], ...this.bttv[room] };
            });

        }).catch(err => {
            console.log(`Error fetching BTTV emotes: ${err}`);
            return {};
        });
    }

    public static getFfzEmotes(room: string, update: boolean = false) : Promise<any> {
        
        const room_promise = !update && this.ffz[room] || this.get(`${ffz_channel}${room}`).then(channel => {
            return channel.sets[channel.room.set].emoticons.reduce((obj, item) => {
                obj[item.name] = item;
                return obj;
            }, {});
        }).catch(err => {
            return {};
        });

        const global_promise = !update && this.ffz['_global'] || this.get(ffz_global).then(global => {
            return global.default_sets.map(n => {
                return global.sets[n].emoticons;
            }).flat().reduce((obj, item) => {
                obj[item.name] = item;
                return obj;
            }, {});
        }).catch(err => {
            return {};
        });

        return Promise.all([room_promise, global_promise]).then(values => {
            this.ffz[room] = values[0];
            this.ffz['_global'] = values[1];
            return { ...values[0], ...values[1] };
        });


    }

    public static getTwitchEmotes(room: string, update: boolean = false)    {
        // return this.get(`${ffz_channel}${room}`).then(global => {
        //     this.get(ffz_global).then(channel => {

        //     });
        // }).catch(err => {
        //     console.log(`Error fetching FFZ emotes: ${err}`);
        //     return {};
        // });
    }

    public static getBadges(room: string, update: boolean = false) : Promise<any> {
        
        return this.get(badges_global).then(global => {
            
            this.badges['_global'] = global.badge_sets;

            return this.get(`${badges_channel}${room}/display`).then(channel => {
                this.badges[room] = channel.badge_sets;
                return _.merge(global.badge_sets, channel.badge_sets);
            })
        }).catch(err => {
            console.log(`Error fetching channel badges: ${err}`);
            return {};
        });
    }

    public static getCheers(room: string, update: boolean = false) {
        
    }

    public static get(url: string) {
        return axios.get(url).then((response) => {
                return response.data;
        }).catch(err => {
                throw err;
        });
    }
}
