const { app, BrowserWindow, ipcMain: ipc } = require('electron');
const path = require('path');
const configuration = require('./utils/config/config.js');

let configWin;
let bubbleWin;

ipc.on('config', (event, config) => {
  configuration.saveSettings(null, config);
});

createWindow = _ => {
  configWin = new BrowserWindow({
    width: 510,
    height: 850,
    frame: true,
    autoHideMenuBar: true,
    resizable: false,
    title: "Headmouse Configuration",
    backgroundColor: '#373737',
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve('./utils/settings/preload.js')
    }
  });

  configWin.loadURL('http://localhost:3000/');

  configWin.webContents.openDevTools();

  configWin.on('close', _ => {  //<--Emitted when the window is going to be closed
    configWin.webContents.send('app-close');
  });

  configWin.on('closed', _ => {  //<--Emitted when the window is already closed
    configWin = null
  });
}

createBubble = () => {
  bubbleWin = new BrowserWindow({
    width: 150, //150
    height: 150, //150
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve('./utils/bubble/preload.js')
    },
    x: -78,
    y: -90
  });

  bubbleWin.loadFile('./frontend/src/screens/Bubble/bubble.html');

  // bubble.webContents.openDevTools();

  bubbleWin.on('closed', _ => {
    bubbleWin = null
  });
}

app.on('ready', createBubble);

app.on('window-all-closed', _ => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', _ => {
  if (bubbleWin === null) {
    createBubble();
  }
})

ipc.on('open-settings', () => {
  if (configWin) {
    return
  }

  createWindow();
});
