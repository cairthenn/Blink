import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'

@Injectable({
    providedIn: 'root'
})
export class IrcService {

    private static server: string = 'http://localhost:8000';
    private static socket : io.Socket;
    private static chat_handlers : any = {};
    private static user_handlers : any = {};
    private static room_handlers : any = {};

    constructor() { 

    }

    public static handle_message(channel: string, message: any) {
        if(this.chat_handlers[channel] !== undefined) {
            this.chat_handlers[channel](message);
        }
    }

    public static handle_user_state(channel: string, state: any) {
        if(this.user_handlers[channel] !== undefined) {
            this.user_handlers[channel](state);
        }
    }

    public static handle_room_state(channel: string, state: any) {
        if(this.room_handlers[channel] !== undefined) {
            this.room_handlers[channel](state);
        }
    }

    public static init(success: (n: string) => any, failure: () => any) {
        this.socket = io(IrcService.server);
        this.socket.on('chat', (channel: string, message: Object) => {
            this.handle_message(channel, message);
        })

        this.socket.on('user-state', (channel: string, message: Object) => {
            this.handle_user_state(channel, message);
        })

        this.socket.on('room-state', (channel: string, message: Object) => {
            this.handle_room_state(channel, message);
        })

        this.socket.on('irc-connected', (username : string) => {
            success(username);
        });

        this.socket.on('irc-connection-failed', () => {
            failure();
        });
    }

    public static join(channel: string, message: (n: Object) => any, user: (n: Object) => any, room: (n: Object) => any) {

        this.chat_handlers[channel] = message;
        this.user_handlers[channel] = user;
        this.room_handlers[channel] = room;

        this.socket.emit('join', channel);
    }

    public static part(channel: string) {
        this.socket.emit('part', channel);
    }

    public static send_message(channel: string, message: string) {
        this.socket.emit('outgoing-chat', channel, message);
    }

}
