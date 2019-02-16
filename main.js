const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const platform = require('os').platform();
const auth = require('./oauth');
const { IRC } = require('./irc');
const io = require('socket.io'),
      server = io.listen(8000);

let window;
let clientSocket;

const irc = new IRC();



server.on('connect', (socket) => {
    clientSocket = socket;
    socket.on('outgoing-chat', (channel, message) => irc.sendMessage(channel, message));
    socket.on('join', (channel) => irc.join(channel));
    socket.on('part', (channel) => irc.part(channel));

    irc.on(/(\w*) #(\w*)(?: :(.*))?$/, (type, channel, params, message)  => {
        socket.emit('irc-data', type, channel, params, message);
    })

    // irc.on(/RECONNECT/, (channel) => {
    //     socket.emit('reconnect', channel);
    // });

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
        server.close();
        app.quit();
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