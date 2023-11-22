const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('changeScreenAPI', {
  goToScreen: (screen) => ipcRenderer.send('go-to-screen', screen),
});

contextBridge.exposeInMainWorld('bookAPI', {
  getBook: () => ipcRenderer.invoke('get-books'),
});