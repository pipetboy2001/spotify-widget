import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import AutoLaunch from 'auto-launch';

let mainWindow = null; // Definir la variable globalmente
let tray = null; // Evitar doble definición

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 200,
    resizable: false,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    show: false,
    alwaysOnTop: true,
    icon: process.platform === 'linux' ? join(__dirname, '../../resources/icon.png') : undefined,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: true,
      sandbox: false
    }
  });

  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  // Mostrar la ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (is.dev) {
      mainWindow.webContents.openDevTools();
      }
  });

  // Cargar la app según el entorno
  const appURL = process.env['ELECTRON_RENDERER_URL'];
  if (is.dev && appURL) {
    mainWindow.loadURL(appURL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

// Configurar auto-launch
const spotifyWidgetAutoLauncher = new AutoLaunch({
  name: 'SpotifyWidget',
  path: app.getPath('exe')
});

spotifyWidgetAutoLauncher.isEnabled()
  .then((isEnabled) => {
    if (!isEnabled) spotifyWidgetAutoLauncher.enable();
  })
  .catch((err) => console.error('Error al verificar auto-launch:', err));

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.spotify.widget');

  // Configurar icono en la bandeja del sistema
  const trayIcon = nativeImage.createFromPath(trayIconPath);
  const trayIconPath = join(__dirname, '../../resources/icon.png');
  tray = new Tray(nativeImage.createFromPath(trayIconPath));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Mostrar', click: () => mainWindow.show() },
    { label: 'Salir', click: () => {
        mainWindow.destroy();
        app.quit();
      } 
    }
  ]);

  tray.setToolTip('Spotify Widget');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow.show());

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Cerrar la app correctamente en Windows y Linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC para debug
ipcMain.on('ping', () => console.log('pong'));
