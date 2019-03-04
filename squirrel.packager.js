

const dir = `blink-${process.platform}-${process.arch}/`;
const author = 'cairthenn';

if(process.platform === 'win32') {
    const ei = require('electron-winstaller');
    const result = ei.createWindowsInstaller({
        appDirectory: dir,
        authors: author,
        setupExe: `setup-${process.platform}-${process.arch}.exe`,
        noMsi: true,
    });
    
    result.then(() => console.log('Installer created successfully'))
        .catch(err => console.log(`Error creating installer: ${err}`));    
} else if(process.platform === 'darwin') {
    const dmg = require('electron-installer-dmg')
    dmg({
        appPath: dir,
        name: 'Blink',
        path: 'installer',
    }, (err) => {
        console.log(err);
    })
}

