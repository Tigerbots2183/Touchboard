const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('path')
const koffi = require('koffi')

const DwmSetWindowAttribute = process.platform === 'win32'
  ? koffi.load('dwmapi.dll').func('long __stdcall DwmSetWindowAttribute(uintptr_t hwnd, uint32_t dwAttribute, const void* pvAttribute, uint32_t cbAttribute)')
  : null;

if (require('electron-squirrel-startup')) app.quit();

const COLOR = Buffer.from([0x0c, 0x0c, 0x0c, 0x00]);

function applyTitleBarColor(win) {
  if (!DwmSetWindowAttribute || win.isDestroyed()) return;
  const buf = win.getNativeWindowHandle();
  const hwnd = buf.length === 8 ? buf.readBigUInt64LE(0) : buf.readUInt32LE(0);
  DwmSetWindowAttribute(hwnd, 35, COLOR, 4);
}


const createWindow = () => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  applyTitleBarColor(win)

    win.on('ready-to-show', () => applyTitleBarColor(win));
  win.on('focus', () => applyTitleBarColor(win));
  win.on('blur', () => applyTitleBarColor(win));
  
  // win.webContents.openDevTools()
  win.setMenu(null)

  win.loadFile('index.html')



  ipcMain.on('button-clicked', (event) => {
    const targetWin = BrowserWindow.fromWebContents(event.sender) ?? win;
    if (targetWin && !targetWin.isDestroyed()) {
      targetWin.webContents.openDevTools();
    }
  });

  win.webContents.session.on('will-download', (event, item, webContents) => {
    // 1. Define where the file should be saved automatically
    const filePath = path.join(app.getPath('downloads'), item.getFilename())

    // 2. Set the path to prevent the "Save As" dialog prompt
    item.setSavePath(filePath)

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })

    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully saved to:', filePath)
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  })
}



app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})