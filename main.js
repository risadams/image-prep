const { app, BrowserWindow } = require('electron');

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Image-Prep',
    icon: `${__dirname}/assets/icons/ris1.png`,
  });

  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}

app.on('ready', createMainWindow);
