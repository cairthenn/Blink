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

import { Web } from './web';

const bttvGlobalUrl = 'https://api.betterttv.net/2/emotes';
const bttvChannelUrl = 'https://api.betterttv.net/2/channels/';
const ffzGlobalUrl = 'https://api.frankerfacez.com/v1/set/global';
const ffzChannelUrl = 'https://api.frankerfacez.com/v1/room/';

export class WebApiService {

    public static ffz: any = {};
    public static bttv: any = {};


    public static getBttvGlobal(update: boolean = false) {
        return !update && this.bttv._global || Web.get(bttvGlobalUrl).then(global => {
            return this.bttv._global = global.emotes;
        });
    }

    public static getBttvRoom(room: string, update: boolean = false) {
        return !update && this.bttv[room] || Web.get(`${bttvChannelUrl}${room}`).then(channel => {
            return this.bttv[room] = channel.emotes;
        }).catch(() => []);
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
        return !update && this.ffz._global || Web.get(ffzGlobalUrl).then(global => {
            return this.ffz._global = global.default_sets.map(n => {
                return global.sets[n].emoticons;
            }).flat();
        });
    }

    public static getFFzRoom(room: string, update: boolean = false): Promise<any> {
        return !update && this.ffz[room] || Web.get(`${ffzChannelUrl}${room}`).then(channel => {
            return this.ffz[room] = channel.sets[channel.room.set].emoticons;
        }).catch(() => []);
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
}
