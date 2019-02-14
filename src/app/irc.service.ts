import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'

@Injectable({
    providedIn: 'root'
})
export class IrcService {

    private static server: string = 'http://localhost:8000';
    private static socket : io.Socket;
    private static chatHandlers : any = {};
    private static userHandlers : any = {};
    private static roomHandlers : any = {};

    constructor() { 

    }

    public static handleMessage(channel: string, message: any) {
        if(this.chatHandlers[channel] !== undefined) {
            this.chatHandlers[channel](message);
        }
    }

    public static handleUserState(channel: string, state: any) {
        if(this.userHandlers[channel] !== undefined) {
            this.userHandlers[channel](state);
        }
    }

    public static handleRoomState(channel: string, state: any) {
        if(this.roomHandlers[channel] !== undefined) {
            this.roomHandlers[channel](state);
        }
    }

    public static init(success: (name: string, token: string) => any, failure: () => any) {
        this.socket = io(IrcService.server);
        this.socket.on('chat', (channel: string, message: Object) => {
            this.handleMessage(channel, message);
        })

        this.socket.on('user-state', (channel: string, message: Object) => {
            this.handleUserState(channel, message);
        })

        this.socket.on('room-state', (channel: string, message: Object) => {
            this.handleRoomState(channel, message);
        })

        this.socket.on('irc-connected', (username : string, token: string) => {
            success(username, token);
        });

        this.socket.on('irc-connection-failed', () => {
            failure();
        });
    }

    public static join(channel: string, message: (n: Object) => any, user: (n: Object) => any, room: (n: Object) => any) {

        this.chatHandlers[channel] = message;
        this.userHandlers[channel] = user;
        this.roomHandlers[channel] = room;

        this.socket.emit('join', channel);
    }

    public static part(channel: string) {

        delete this.chatHandlers[channel]
        delete this.userHandlers[channel]
        delete this.roomHandlers[channel]

        this.socket.emit('part', channel);
    }

    public static sendMessage(channel: string, message: string) {
        this.socket.emit('outgoing-chat', channel, message);
    }

}
