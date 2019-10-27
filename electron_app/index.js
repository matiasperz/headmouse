const { app, BrowserWindow, ipcMain: ipc } = require('electron');
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let bubble;

createWindow = _ => {
  // Create the browser window.
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

  // and load the localhost:3000 or a static file
  win.loadURL('http://localhost:3000/');

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', _ => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });
}

createBubble = () => {
  bubble = new BrowserWindow({
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

  bubble.loadFile('./frontend/src/screens/Bubble/bubble.html');

  // bubble.webContents.openDevTools();

  bubble.on('closed', _ => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    bubble = null
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createBubble);

// Quit when all windows are closed.
app.on('window-all-closed', _ => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', _ => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.