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

const { app, BrowserWindow, Menu, shell } = require('electron');
const settings = require('electron-settings');
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

    irc.on(/(\w*) #(\w*)(?: :(.*))?$/, (type, channel, params, message)  => {
        socket.emit('irc-data', type, channel, params, message);
    })

    tryLogin();
});

app.on('ready', function() {

    const width = settings.get('width') || 500;
    const height = settings.get('height') || 800;
    const x = settings.get('x');
    const y = settings.get('y');

    window = new BrowserWindow( {
        minWidth: 340,
        x: x,
        y: y,
        width: width,
        height: height,
        show: false,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
        },
        icon: './dist/assets/icon.png',
    });

    window.on('close', () => {
        const size = window.getSize();
        const position = window.getPosition();
        settings.set('width', size[0]);
        settings.set('height', size[1]);
        settings.set('x', position[0]);
        settings.set('y', position[1]);
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
    // window.webContents.toggleDevTools();


    window.loadFile('./dist/index.html');
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