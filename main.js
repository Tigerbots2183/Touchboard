const { app, BrowserWindow } = require('electron/main')

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
  const win = new BrowserWindow()
  // win.webContents.openDevTools()
  // win.setMenu(null)

  win.loadFile('index.html')
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