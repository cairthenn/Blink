const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const platform = require('os').platform();
const auth = require('./oauth');
const { IRC } = require('./irc');
const io = require('socket.io'),
      server = io.listen(8000);

let window;
let client_socket;

const irc = new IRC();

ipcMain.on('IRCReady', () => { 
    console.log('Received Init From Angular');
});

const msg = /^@badges=([^;]*);color=([^;]*);display-name=([^;]*);(?:emote-only=([\d]*);)?emotes=([^;]*);flags=([^;]*);id=([^;]*);.*PRIVMSG #(\w*) :(.*)$/iu
const user_state = /^@badges=([^;]*);color=([^;]*);display-name=([^;]*);emote-sets=([^;]*);mod=([^;]*);subscriber=([^;]*);user-type=(.*) :tmi.twitch.tv USERSTATE #(\w*)$/iu
const room_state = /^@broadcaster-lang=([^;]*);emote-only=([^;]*);followers-only=([^;]*);r9k=([^;]*);rituals=([^;]*);room-id=([^;]*);slow=(.*);subs-only=(.*) :tmi.twitch.tv ROOMSTATE #(\w*)$/iu



server.on('connect', (socket) => {
    client_socket = socket;
    socket.on('outgoing-chat', (channel, message) => irc.send_message(channel, message));
    socket.on('join', (channel) => irc.join(channel));
    socket.on('part', (channel) => irc.part(channel));

    irc.on(msg, info => {
        const message = {
            badges: info[1],
            color: info[2],
            username: info[3],
            emote_only: info[4],
            emotes: info[5],
            flags: info[6],
            id: info[7],
            channel: info[8],
            message: info[9],
        }

        socket.emit('chat', info[8], message);
    })

    irc.on(user_state, info => {
        const state = {
            badges: info[1],
            color: info[2],
            username: info[3],
            emote_sets: info[4],
            moderator: info[5],
            subscriber: info[6],
            user_type: info[7]
        }
        socket.emit('user-state', info[8], state);
    });

    irc.on(room_state, info => {
        const state = {
            lang: info[1],
            emote_only: info[2],
            followers_only: info[3],
            r9k: info[4],
            rituals: info[5],
            room_id: info[6],
            slow: info[7],
            sub_only: info[8],
        }
        socket.emit('room-state', info[9], state);
    });

    auth.get_login().then((login) => {
        irc.connect(login.user, login.token).then(() => {
            socket.emit('irc-connected', true);
        }).catch(err => {
            socket.emit('irc-connected', false);
            console.log(`Error connecting to IRC: ${err}`);
        });
    });
});

app.on('ready', function() {
    window = new BrowserWindow( {
        show: false,
        backgroundColor: '#202020',
        icon: './dist/assets/icon.png',
    });
    
    window.on('closed', () => {
        irc.disconnect();
        app.quit();
        server.close();
        window = null;
    });
    
    window.on('ready-to-show', () => { 
        window.show();
    });

    window.loadFile('dist/index.html');
});

const standard_template = [ {
    label: 'Account',
    submenu: [
        {
            label: 'Login',
            click() {
                auth.get_login(true).then((login) => {
                    irc.connect(login.user, login.token).then(() => {
                        console.log('connected');
                    }).catch(err => {
                        console.log(err);
                    });
                });
            }
        },
    ]
} ];

function handle_login(login) {

}

// The first menu slot on Mac OS is reserved by the application
const mac_template = [ { label : 'Dawrin Placeholder' } ].concat(standard_template);
const main_menu = Menu.buildFromTemplate( platform == 'darwin' ? mac_template : standard_template );
Menu.setApplicationMenu(main_menu);