const { app, BrowserWindow, Menu, shell } = require('electron');
const platform = require('os').platform();
const auth = require('./oauth');
const { IRC } = require('./irc');

const server = require('https').createServer();
const io = require('socket.io')(server);

let window;
let clientSocket;
let loggingIn = false;

const irc = new IRC();

function tryLogin(force = false) {
    
    if(loggingIn) {
        return;
    }

    if(!clientSocket) {
        console.log('Local connection not yet established.')
        return;
    }

    loggingIn = true;
    
    auth.getLogin(force).then((login) => {
        loggingIn = false;
        irc.connect(login.user, login.token).then(() => {
            clientSocket.emit('irc-connected', login.user, login.token);
        }).catch(err => {
            clientSocket.emit('irc-connection-failed');
            console.log(`Error connecting to IRC: ${err}`);
        });
    }).catch(err => {
        loggingIn = false;
        clientSocket.emit('irc-connection-failed');
        console.log(`Error connecting to IRC: ${err}`);
    });
}

io.on('connect', (socket) => {
    clientSocket = socket;
    socket.on('outgoing-chat', (channel, message) => irc.sendMessage(channel, message));
    socket.on('join', (channel) => irc.join(channel));
    socket.on('part', (channel) => irc.part(channel));
    socket.on('logout', () => irc.disconnect());
    socket.on('login', (force) => tryLogin(force));
    socket.on('open-url', (url) => {
        shell.openExternal(url);
    })

    irc.on(/(\w*) #(\w*)(?: :(.*))?$/, (type, channel, params, message)  => {
        socket.emit('irc-data', type, channel, params, message);
    })

    tryLogin();
});

app.on('ready', function() {
    window = new BrowserWindow( {
        minWidth: 340,
        height: 650,
        width: 490,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
        },
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

    io.listen(8000);
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
                    tryLogin(true);
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