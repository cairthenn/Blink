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

const { Socket } = require('net');

const host = 'irc.chat.twitch.tv';
const port = 6667;
const messageFormat = /^@?(?<params>.*):.*tmi.twitch.tv (?<message>.*)/;
const paramsFormat = /([^=]*)=([^;]*);?/g;

module.exports.IRC = class {

    constructor() {
        this.connected = false;
        this.callbacks = [];
        this.channels = [];
    }


    send(data) {
        if(!this.connected) {
            return;
        }

        this.socket.write(`${data}\n`, 'utf-8');
    }

    connect(user, token) {

        if(this.connected) {
            this.disconnect();
        }

        this.socket = new Socket();
        this.user = user;

        return new Promise((resolve, reject) => {
           this.socket.on('connect', () => {
                this.connected = true;
                this.send(`PASS oauth:${token}`);
                this.send(`NICK ${user}`);
                this.send(`CAP REQ :twitch.tv/tags`);
                this.send(`CAP REQ :twitch.tv/commands`);
                this.channels.forEach(c => {
                    this.join(c, true);
                })
                resolve();
            });

            this.socket.on('data', (data) => {
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


            this.socket.on('close', () => {
                if(this.connected) {
                    this.callbacks['connection-lost'][0]();
                }
                console.log('attempting reconnection')
                setTimeout(() => {
                    this.connect(user, token);
                }, 15000);
            })

            this.socket.on('error', (err) => {
                console.log(err);
            })
            
            try {
                this.socket.connect(port, host);
            } catch {

            }
        });
    }

    disconnect() {
        if(!this.connected) {
            return;
        }
        this.send('QUIT');
        this.connected = false;
        this.socket.end();
    }

    join(channel, force = false) {
        if(!force && this.channels.includes(channel)){
            return;
        }
        this.channels.push(channel);
        this.send(`JOIN #${channel}`);
    }

    part(channel) {
        if(!this.channels.includes(channel)) {
            return;
        }

        this.channels = this.channels.filter(x => x != channel);

        this.send(`PART #${channel}`);
    }

    sendMessage(channel, message) {
        if(!this.channels.includes(channel)) {
            return;
        }
        this.send(`:${this.user}!${this.user}@${this.user}.tmi.twitch.tv PRIVMSG #${channel} :${message}`);
    }

    on(regex, callback) {
        this.callbacks.push([regex, callback, false]);
    }

    once(regex, callback) {
        this.callbacks.push([regex, callback, true]);
    }

    receive(data) {

        const split = messageFormat.exec(data);

        if(!split) {
            console.log(`Unable to parse incoming IRC message: ${data}`);
            return;
        }


        const params = {}
        var match;
        while(match = paramsFormat.exec(split.groups.params)) {
            params[match[1]] = match[2].trim();
        }

        for(var i = 0; i < this.callbacks.length; i++) {
            const cb = this.callbacks[i];
            const match = cb[0].exec(split.groups.message);
            if(match) {
                cb[1](match[1], match[2], params, match[3]);
                if(cb[2]) {
                    this.callbacks.splice(i, 1);
                }
                return true;
            }
        }
    }
}