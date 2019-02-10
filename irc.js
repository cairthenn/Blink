const { Socket } = require('net');

const host = 'irc.chat.twitch.tv';
const port = 6667;

module.exports.IRC = class {

    constructor() {
        this.connected = false;
        this.callbacks = [];
        this.channels = {};
        this.on(/^PING \:(.*)$/i, (match) => {
            this.send(`PONG :${match[1]}`);
        })
    }

    
    send(data) {
        this.socket.write(`${data}\n`, 'utf-8', function() {
            console.log(`> ${data}`);
        });
    }

    connect(user, token) {
        
        if(this.connected) {
            this.disconnect();
        }

        const self = this;
        this.socket = new Socket();
        this.user = user;

        return new Promise(function(resolve, reject) {
           self.socket.on('connect', function() {
                self.connected = true;
                self.send(`PASS oauth:${token}`);
                self.send(`NICK ${user}`);
                self.send(`CAP REQ :twitch.tv/tags`);
                self.send(`CAP REQ :twitch.tv/commands`);
                resolve();
            });
    
            self.socket.on('data', function(data) {
                const msgs = String(data).split('\n');
                msgs.forEach(msg => {
                    console.log(`< ${msg}`);
                    if(msg.length > 0) {
                        self.receive(msg.trim());
                    }
                });
            });
    
            self.socket.connect(port, host);
        });
    }
    
    disconnect() {
        this.connected = false;
        this.send('QUIT');
        this.socket.end();
    }

    join(channel) {
        if(channel in this.channels){
            return;
        }
        this.channels[channel] = true;
        this.send(`JOIN #${channel}`);
    }

    part(channel) {
        if(!(channel in this.channels)) {
            return;
        }
        delete this.channels[channel];
        this.send(`PART #${channel}`);
    }

    send_message(channel, message) {
        console.log(channel, message, channel in this.channels);
        if(!(channel in this.channels)) {
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
        console.log(data);
        for(var i = 0; i < this.callbacks.length; i++) {
            const cb = this.callbacks[i];
            const match = cb[0].exec(data);
            if(match) {
                cb[1](match, data);
                if(cb[2]) {
                    this.callbacks.splice(i, 1);
                }
            }
        }
    }
}