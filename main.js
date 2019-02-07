const Electron = require('electron');
const { app, net, BrowserWindow, Menu } = Electron;
const auth = require('./auth');
const platform = require('os').platform();

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

let main_menu;
const menu_template = [ {
    label: 'Account',
    submenu: [
        {
            label: 'Login',
            click() {
                auth.open_auth_window(true);
            }
        },
    ]
} ];

if(platform == 'darwin') {
    // Comply with Mac menu bars
    main_menu = Menu.buildFromTemplate( [ { label : 'MacOS Placeholder' } ].concat(menu_template));
} 
else {
    Menu.buildFromTemplate(menu_template);
}
