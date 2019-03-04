const ei = require('electron-winstaller');


const result = ei.createWindowsInstaller({
    appDirectory: `blink-${process.platform}-${process.arch}/`,
    authors: 'cairthenn',
    setupExe: `setup-${process.platform}-${process.arch}`,
    noMsi: true,
});

result.then(() => console.log('Installer created successfully'))
    .catch(err => console.log(`Error creating installer: ${err}`));
