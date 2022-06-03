const { app, BrowserWindow } = require('electron');

function createMainWindow(){
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Image-Prep',
  });
}

app.on('ready',createMainWindow);
