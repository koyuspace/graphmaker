/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, dialog, nativeTheme } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';

const fs = require('fs');
const ipc = require('electron').ipcMain;

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: nativeTheme.shouldUseDarkColors ? '#333' : '#fff',
      symbolColor: nativeTheme.shouldUseDarkColors ? '#fff' : '#333',
    },
  });

  if (process.platform !== 'win32') {
    mainWindow.webContents.insertCSS('#titlebar{display:none;}');
  } else {
    mainWindow.webContents.insertCSS(
      'body{height: calc(100% - 32px);margin-top: 32px;}'
    );
  }

  mainWindow.setMenu(null);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipc.on('run-save-dialog', function (event, arg) {
  const options = {
    defaultPath: 'graph.json',

    filters: [
      { name: 'json', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  };

  // eslint-disable-next-line promise/catch-or-return
  dialog.showSaveDialog(null, options).then(({ filePath }) => {
    fs.writeFileSync(filePath, arg, 'utf-8');
  });
});

ipc.on('run-open-dialog', function (event, arg) {
  const options = {
    defaultPath: '',

    filters: [
      { name: 'json', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  };

  // eslint-disable-next-line promise/catch-or-return
  dialog.showOpenDialog(options).then(response => {
    fs.readFile(response.filePaths[0], 'utf-8', (err, data) => {
      if (err) {
        alert(`An error ocurred reading the file :${err.message}`);
        return;
      }

      mainWindow.webContents.send('restore-flow', data);
    });
  });
});
