const { app, BrowserWindow, ipcMain: ipc } = require('electron');
const path = require('path');
const configuration = require('./utils/config/config.js');

const HeadMouseSerial = require('./utils/HeadMouseSerial');

let configWin;
let bubbleWin;

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

  configWin.webContents.once('dom-ready', () => {
    configWin.webContents.send('app-init', configuration.readSettings());
  });

  configWin.on('close', _ => {
    HeadMouseSerial.unsubscribeUpdater(winUpdateHandler(configWin));
    configWin.webContents.send('app-close');
  });

  configWin.on('closed', () => {
    configWin = null;
  });
}

createBubble = () => {
  bubbleWin = new BrowserWindow({
    width: 172, //172
    height: 172, //172
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve('./utils/bubble/preload.js')
    },
    x: -88, //-88
    y: -100 //-100
  });

  bubbleWin.loadFile('./frontend/src/screens/Bubble/bubble.html');

  // bubbleWin.webContents.openDevTools();

  bubbleWin.on('closed', _ => {
    bubbleWin = null
  });
}

winUpdateHandler = (win) => {
  return (type, message) => {
    win.webContents.send(type, message);
  }
};

app.on('ready', () => {
  createBubble();
  HeadMouseSerial.subscribeUpdater(winUpdateHandler(bubbleWin));
  HeadMouseSerial.establishArduinoComunication();
});

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
  HeadMouseSerial.subscribeUpdater(winUpdateHandler(configWin));
  HeadMouseSerial.establishArduinoComunication();
});

ipc.on('send', (event, jsonMessage) => {
  HeadMouseSerial.send(jsonMessage);
});

ipc.on('config', (event, config) => {
  configuration.saveSettings(null, config);
});
