const { app, BrowserWindow, Menu } = require('electron');

/* Setting the environment variables. */
process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

let mainWindow;
let aboutWindow;

const menu = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { label: 'about', click() { createAboutWindow(); } },
    ]
  }] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => app.quit()
      },
      { type: 'separator' },
      { role: 'toggledevtools' },
    ]
  },
  ...(isDev ? [{
    label: 'Developer',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { type: 'separator' },
      { role: 'toggledevtools' },
    ]
  }] : []),
  ...(!isMac ? [
    {
      label: 'Help',
      submenu: [
        { label: 'about', click() { createAboutWindow(); } }
      ]
    }
  ] : [])
];

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 320,
    height: 320,
    title: 'About Image-Prep',
    icon: `${__dirname}/assets/icons/ris1.png`,
    resizable: false,
    backgroundColor: 'white'
  });

  aboutWindow.loadURL(`file://${__dirname}/app/about.html`);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Image-Prep',
    icon: `${__dirname}/assets/icons/ris1.png`,
    resizable: isDev,
    backgroundColor: '#ccc'
  });

  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('ready', () => mainWindow = null)
});
app.allowRendererProcessReuse = true;
