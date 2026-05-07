const { app, BrowserWindow } = require('electron/main')
const path = require('path')

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
  const win = new BrowserWindow()
  // win.webContents.openDevTools()
  // win.setMenu(null) 

  win.loadFile('index.html')

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