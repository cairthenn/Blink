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

        this.socket.write(`${data}\n`, 'utf-8', function() {
            console.log(`< ${data}`);
        });
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
                        if(msg === 'PING :tmi.twitch.tv') {
                            this.send('PONG :tmi.twitch.tv');
                        } else {
                            // TEMPORARY: prevent logging message if handled
                            if(this.receive(msg)) {
                                return;
                            }
                        }
                        console.log(`> ${msg}`);
                    }
                });
            });
    
            this.socket.connect(port, host);
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
            console.log("Unable to parse incoming IRC message:" + data);
            return;
        }


        const params = {}
        var match;
        while(match = paramsFormat.exec(split.groups.params)) {
            params[match[1]] = match[2];
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