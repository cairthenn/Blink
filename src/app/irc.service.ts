import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'

@Injectable({
    providedIn: 'root'
})
export class IrcService {

    private static server: string = 'http://localhost:8000';
    private static socket : io.Socket;


    private static handlers : Object = {};

    constructor() { 

    }

    public static init(success: (name: string, token: string) => any, 
                        failure: (err: string) => any) {

        this.socket = io.connect(this.server)
        
        this.socket.on('irc-data', (type: string, channel: string, params: any, message: string) => {
            if(!(channel in this.handlers)) {
                console.log(`Message for unjoined channel: ${channel} - ${message}`);
                return;
            }
            if(!(type in this.handlers[channel])) {
                console.log(`No handler available for message type: ${type} - ${message}`);
                return;
            }

            this.handlers[channel][type](params, message);
        });

        this.socket.on('irc-connected', (username : string, token: string) => {
            success(username, token);
        });

        this.socket.on('irc-connection-failed', (err) => {
            failure(err);
        });

    }

    public static join(channel: string, handlers: Object) {
        this.handlers[channel] = handlers;
        this.socket.emit('join', channel);
    }

    public static part(channel: string) {
        delete this.handlers[channel];
        this.socket.emit('part', channel);
    }

    public static sendMessage(channel: string, message: string) {
        this.socket.emit('outgoing-chat', channel, message);
    }

    public static saveSettings(vals) {
        this.socket.emit('save-settings', vals);
    }

}
