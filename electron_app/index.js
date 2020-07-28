const { app, BrowserWindow, ipcMain: ipc, protocol } = require('electron');
const path = require('path');
const url = require('url');
const configuration = require('./utils/config/config.js');

const HeadMouseSerial = require('./utils/HeadMouseSerial');

let configWin;
let bubbleWin;

createWindow = _ => {
  const WEB_FOLDER = './frontend/build';
  const PROTOCOL = 'file';

  protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
    // Strip protocol
    let url = request.url.substr(PROTOCOL.length + 1);

    // Build complete path for node require function
    url = path.join(__dirname, WEB_FOLDER, url);

    // Replace backslashes by forward slashes (windows)
    url = url.replace(/\\/g, '/');
    url = path.normalize(url);

    callback({path: url});
  });

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
      preload: path.resolve(__dirname, './utils/settings/preload.js')
    }
  });

  configWin.loadURL(url.format({
    pathname: 'index.html',
    protocol: PROTOCOL + ':',
    slashes: true
  }));

  // configWin.webContents.openDevTools();

  configWin.webContents.once('dom-ready', () => {
    configWin.webContents.send('app-init', configuration.readSettings());
    HeadMouseSerial.establishArduinoComunication();
    // HeadMouseSerial.sendInitialConfig(configuration.readSettings());
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
      preload: path.resolve(__dirname, './utils/bubble/preload.js')
    },
    x: -88, //-88
    y: -100 //-100
  });

  bubbleWin.loadFile('./frontend/src/screens/Bubble/bubble.html');

  // bubbleWin.webContents.openDevTools();

  bubbleWin.webContents.once('dom-ready', () => {
    HeadMouseSerial.establishArduinoComunication();
    // HeadMouseSerial.sendInitialConfig(configuration.readSettings());
  });

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
});

ipc.on('send', (event, jsonMessage) => {
  HeadMouseSerial.send(jsonMessage);
});

ipc.on('config', (event, config) => {
  configuration.saveSettings(null, config);
});
