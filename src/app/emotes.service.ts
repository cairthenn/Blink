import { Injectable } from '@angular/core';
import axios from 'axios';

const bttv_global = "https://api.betterttv.net/2/channels/";
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

  public static get_bttv_emotes(room: string, update: boolean = false) {

    const channel = this.get(`${bttv_channel}${room}`)
    const global = this.get(bttv_global);
  }

  public static get_ffz_emotes(room: string, update: boolean = false) {
    const channel = this.get(`${ffz_channel}${room}`)
    const global = this.get(ffz_global);
  }

  public static get_twitch_emotes(room: string, update: boolean = false) {
    
  }

  public static get_badges(room: string, update: boolean = false) {
    const channel = this.get(`${badges_channel}${room}/display`)
    const global = this.get(badges_global);


    console.log(channel);
    console.log(global);

    return {};
  }

  public static get_cheers(room: string, update: boolean = false) {
    
  }

  public static get(url: string) {
    axios.get(url).then((response) => {
        return response.data;
    }).catch(err => {
        throw err;
    });
  }
}
