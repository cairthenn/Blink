

const dir = `blink-${process.platform}-${process.arch}/`;
const author = 'cairthenn';

if(process.platform === 'win32') {
    const ei = require('electron-winstaller');
    const result = ei.createWindowsInstaller({
        appDirectory: dir,
        authors: author,
        exe: "Blink.exe",
        setupExe: `setup-${process.platform}-${process.arch}.exe`,
        loadingGif: `${process.cwd()}/loading.gif`,
        iconUrl: `${process.cwd()}/dist/icon.ico`,
        setupIcon: `${process.cwd()}/dist/icon.ico`,
        noMsi: true,
    });
    
    result.then(() => console.log('Installer created successfully'))
        .catch(err => console.log(`Error creating installer: ${err}`));    
} else if(process.platform === 'darwin') {
    const dmg = require('electron-installer-dmg')
    dmg({
        appPath: dir,
        name: 'Blink',
        out: 'installer',
        icon: `${process.cwd()}/dist/icon.icns`,
    }, (err) => {
        if(err) {
            console.log(err);
        } else {
            console.log('Installer created successfully!')
        }
    })
} else if(process.platform == 'linux') {

}

