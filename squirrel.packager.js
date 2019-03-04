const ei = require('electron-winstaller');


const result = ei.createWindowsInstaller({
    appDirectory: 'blink-win32-x64/',
    authors: 'cairthenn',
    noMsi: true,
});

result.then(() => console.log('Installer created successfully'))
    .catch(err => console.log(`Error creating installer: ${err}`));
