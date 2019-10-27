const { app, BrowserWindow, ipcMain: ipc } = require('electron');
const path = require('path');

let win;
let bubble;

createWindow = _ => {
  win = new BrowserWindow({
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

  win.loadURL('http://localhost:3000/');

  win.webContents.openDevTools();

  win.on('closed', _ => {
    win = null
  });
}

createBubble = () => {
  bubble = new BrowserWindow({
    width: 172, //150
    height: 172, //150
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve('./utils/bubble/preload.js')
    },
    x: -88,
    y: -100
  });

  bubble.loadFile('./frontend/src/screens/Bubble/bubble.html');

  // bubble.webContents.openDevTools();

  bubble.on('closed', _ => {
    bubble = null
  });
}

app.on('ready', () => {
  createBubble();
  
});

app.on('window-all-closed', _ => {

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', _ => {
  if (bubble === null) {
    createBubble();
  }
})

ipc.on('open-settings', () => {
  if(win){
    return
  }

  createWindow();
});