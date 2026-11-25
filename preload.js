const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  buttonClicked: () => ipcRenderer.send('button-clicked'),
});