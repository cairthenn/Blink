const Electron = require('electron');
const { app, net, BrowserWindow, Menu } = Electron;
const auth = require('./auth');

let main_application;

app.on('ready', function() {
    main_application = new BrowserWindow();
    main_application.loadFile('chat_window.html');
    main_application.on('closed', () => {
        app.quit();
        main_application = null;
    });
    main_application.webContents.on('did-finish-load', () => auth.open_auth_window(true));
    Menu.setApplicationMenu(main_menu);
});

const main_menu = Menu.buildFromTemplate([
    {
        label: 'Account',
        submenu: [
            {
                label: 'Login',
                click() {
                    auth.open_auth_window(true);
                }
            },
        ]
    }
]);
