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

const host = 'irc.chat.twitch.tv';
const port = 6667;
const ircFormat = /^@?(.*):.*tmi.twitch.tv (.*)/;
const paramsFormat = /([^=]*)=([^;]*);?/g;
const messageFormat = /(\w*) #(\w*)(?: :(.*))?$/;

import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

@Injectable({
    providedIn: 'root'
})
export class IrcService {
    private handlers: any = {};
    private netSocket : any;

    public connected = false;
    public channels = [];
    private callbacks = [];
    public user: string;

    private Socket;

    constructor() {
        this.Socket = ElectronService.remote.require('net').Socket;
    }

    public connect(name: string, token: string) {

        if(this.connected) {
            this.disconnect();
        }
        this.user = name;
        
        this.netSocket = new this.Socket();

        return new Promise((resolve, reject) => {
            this.netSocket.on('connect', () => {
                this.connected = true;
                this.send(`PASS oauth:${token}`);
                this.send(`NICK ${name}`);
                this.send(`CAP REQ :twitch.tv/tags`);
                this.send(`CAP REQ :twitch.tv/commands`);
                this.channels.forEach(c => {
                    this.joinImpl(c);
                })
                resolve();
            });

            this.netSocket.on('data', (data) => {
                const msgs = String(data).split(/\r?\n/);
                msgs.forEach(msg => {
                    if(msg.length > 0) {
                        if(msg == 'PING :tmi.twitch.tv') {
                            this.send('PONG :tmi.twitch.tv');
                        } else {
                            this.receive(msg);
                        }
                    }
                });
            });

            this.netSocket.on('close', () => {
                console.log('attempting reconnection')
                setTimeout(() => {
                    this.connect(name, token);
                }, 15000);
            });

            this.netSocket.on('error', (err) => {
                console.log(err);
            })

            this.netSocket.connect(port, host);
        });
    }

    public disconnect() {
        if(!this.connected) {
            return;
        }
        this.send('QUIT');
        this.connected = false;
        this.netSocket.end();
    }

    public send(data: string) {
        if(!this.connected) {
            return;
        }

        this.netSocket.write(`${data}\n`, 'utf-8');
    }

    public joinImpl(channel: string) {
        this.send(`JOIN #${channel}`);
    }

    public join(channel: string, callbacks: any) {
        if(this.channels.includes(channel)){
            return;
        }
        
        this.handlers[channel] = callbacks;
        this.channels.push(channel);
        this.joinImpl(channel);
    }

    public part(channel) {
        if(!this.channels.includes(channel)) {
            return;
        }

        delete this.handlers[channel];
        this.channels = this.channels.filter(x => x != channel);
        this.send(`PART #${channel}`);
    }

    public sendMessage(channel: string, message: string) {
        if(!this.channels.includes(channel)) {
            return;
        }
        this.send(`:${this.user}!${this.user}@${this.user}.tmi.twitch.tv PRIVMSG #${channel} :${message}`);
    }


    public on(regex: RegExp, callback) {
        this.callbacks.push([regex, callback, false]);
    }

    public once(regex, callback) {
        this.callbacks.push([regex, callback, true]);
    }

    public receive(data: string) {

        const split = ircFormat.exec(data);

        if(!split) {
            console.log(`Unable to parse incoming IRC message: ${data}`);
            return;
        }

        const params = {}
        var match;
        while(match = paramsFormat.exec(split[1])) {
            params[match[1]] = match[2].trim();
        }

        const msg = messageFormat.exec(split[2]);
        if(!msg) {
            return false;
        }

        const type = msg[1];
        const channel = msg[2];
        const message = msg[3];

        if (!(channel in this.handlers) || !(type in this.handlers[channel])) {
            return;
        }

        this.handlers[channel][type](params, message);

    };
}
