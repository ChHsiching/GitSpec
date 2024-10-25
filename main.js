// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain  } = require('electron')
const { exec } = require('child_process');
const path = require('node:path')

let currentDir = '';

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Get git status and send it to the front end
    exec('git status', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            mainWindow.webContents.send('git-status', `Error: ${stderr}`);
            return;
        }
        mainWindow.webContents.send('git-status', stdout);
    });
}




// Listen to selected warehouse events
ipcMain.on('select-repo', (event) => {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(result => {
        if (!result.canceled) {
            currentDir = result.filePaths[0];
            // Here the getGitStatus function is called and event.sender is passed in
            getGitStatus(event);
        }
    });
});

function getGitStatus(event) {
    exec('git status', { cwd: currentDir }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            event.sender.send('git-status', `Error: ${stderr}`); // 修改为使用 event.sender
            return;
        }
        event.sender.send('git-status', stdout); // 修改为使用 event.sender
    });
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.