const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const platform = require('os').platform();
const auth = require('./oauth');
const { IRC } = require('./irc');
const io = require('socket.io'),
      server = io.listen(8000);

let window;
let clientSocket;

const irc = new IRC();

const msg = /^@badges=([^;]*);color=([^;]*);display-name=([^;]*);(?:emote-only=([\d]*);)?emotes=([^;]*);flags=([^;]*);id=([^;]*);.*PRIVMSG #(\w*) :(.*)$/iu
const userState = /^@badges=([^;]*);color=([^;]*);display-name=([^;]*);emote-sets=([^;]*);mod=([^;]*);subscriber=([^;]*);user-type=(.*) :tmi.twitch.tv USERSTATE #(\w*)$/iu
const roomState = /^@broadcaster-lang=([^;]*);emote-only=([^;]*);followers-only=([^;]*);r9k=([^;]*);rituals=([^;]*);room-id=([^;]*);slow=(.*);subs-only=(.*) :tmi.twitch.tv ROOMSTATE #(\w*)$/iu

server.on('connect', (socket) => {
    clientSocket = socket;
    socket.on('outgoing-chat', (channel, message) => irc.sendMessage(channel, message));
    socket.on('join', (channel) => irc.join(channel));
    socket.on('part', (channel) => irc.part(channel));

    irc.on(msg, info => {
        const message = {
            badges: info[1],
            color: info[2],
            username: info[3],
            emoteOnly: info[4],
            emotes: info[5],
            flags: info[6],
            id: info[7],
            channel: info[8],
            message: info[9],
        }

        socket.emit('chat', info[8], message);
    })

    irc.on(userState, info => {
        const state = {
            badges: info[1],
            color: info[2],
            username: info[3],
            emoteSets: info[4],
            moderator: info[5],
            subscriber: info[6],
            userType: info[7]
        }
        socket.emit('user-state', info[8], state);
    });

    irc.on(roomState, info => {
        const state = {
            lang: info[1],
            emoteOnly: info[2],
            followersOnly: info[3],
            r9k: info[4],
            rituals: info[5],
            roomId: info[6],
            slow: info[7],
            subOnly: info[8],
        }
        socket.emit('room-state', info[9], state);
    });

    auth.getLogin().then((login) => {
        irc.connect(login.user, login.token).then(() => {
            socket.emit('irc-connected', login.user, login.token);
        }).catch(err => {
            socket.emit('irc-connection-failed');
            console.log(`Error connecting to IRC: ${err}`);
        });
    }).catch(err => {
        socket.emit('irc-connection-failed');
        console.log(`Error connecting to IRC: ${err}`);
    });
});

app.on('ready', function() {
    window = new BrowserWindow( {
        minWidth: 250,
        height: 650,
        width: 400,
        show: false,
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

    window.webContents.toggleDevTools();

    window.loadFile('dist/index.html');
});

const standardTemplate = [
    {
        label: 'Account',
        submenu: [
            {
                label: 'Login',
                click() {
                    auth.getLogin(true).then((login) => {
                        irc.connect(login.user, login.token).then(() => {
                            clientSocket.emit('irc-connected', login.user);
                            console.log('connected');
                        }).catch(err => {
                            clientSocket.emit('irc-connection-failed');
                            console.log(`Error connecting to IRC: ${err}`);
                        });
                    }).catch(err => {
                        clientSocket.emit('irc-connection-failed');
                        console.log(`Error connecting to IRC: ${err}`);
                    });
                }
            },
        ]
    },
    {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]
    }];

// The first menu slot on Mac OS is reserved by the application
const macTemplate = [ { label : 'Dawrin Placeholder' } ].concat(standardTemplate);
const mainMenu = Menu.buildFromTemplate( platform == 'darwin' ? macTemplate : standardTemplate );
Menu.setApplicationMenu(mainMenu);