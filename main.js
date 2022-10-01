const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util')

const writeFile = util.promisify(fs.writeFile);

const slash = require('slash');
const webp = require('webp-converter');

const {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
  ipcMain,
  shell
} = require('electron');
const { setTimeout } = require('timers/promises');


/* ------------------------------------------------ */
/* ------------------------------------------------ */

/* Setting the environment variables. */
process.env.NODE_ENV = 'production';

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

/* ------------------------------------------------ */
/* ------------------------------------------------ */

ipcMain.on('image:prep', (event, options) => {
  options.dest = options.dest || path.join(os.homedir(), 'image-prep');

  if (fs.existsSync(options.dest)) {
    fs.rmdirSync(options.dest, { recursive: true }, () => { });
  }
  fs.mkdirSync(options.dest);

  prepImages(options);
});

async function prepImages({ imgPath, quality, dest }) {
  const desiredWidths = [1400, 1057, 640, 320];
  try {

    desiredWidths.forEach((w) => {
      var file = slash(imgPath);
      var name = path.basename(imgPath, path.extname(imgPath));
      var jpgPath = slash(`${dest}/${name}@${w}w.jpg`);
      var webpPath = slash(`${dest}/${name}@${w}w.webp`);

      var img = nativeImage.createFromPath(file);
      resized = img.resize({ width: w, quality: 'best' });
      console.log(`Writing ${jpgPath}`);

      writeFile(jpgPath, resized.toJPEG(parseInt(quality))).then(() => {
        console.log(`${jpgPath} written`);
        webp.cwebp(jpgPath, webpPath, `-q ${quality / 100},logging="-v"`);
      });
    });

    shell.openPath(dest);

    mainWindow.webContents.send('image:done');
  } catch (err) {
    console.error(err);
  }
}


/* ------------------------------------------------ */
/* ------------------------------------------------ */

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 420,
    height: 340,
    title: 'About Image-Prep',
    icon: `${__dirname}/assets/icons/ris1.png`,
    resizable: false,
    backgroundColor: 'white',
  });

  aboutWindow.loadURL(`file://${__dirname}/app/about.html`);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1100 : 480,
    height: 580,
    title: 'Image-Prep',
    icon: `${__dirname}/assets/icons/ris1.png`,
    resizable: isDev,
    backgroundColor: '#ccc',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  mainWindow.loadURL(`file://${__dirname}/app/index.html`);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
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
