const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('changeScreenAPI', {
  goToScreen: (screen) => ipcRenderer.send('go-to-screen', screen),
});

contextBridge.exposeInMainWorld('bookAPI', {
  get: () => ipcRenderer.invoke('get-books'),
  add: (data) => ipcRenderer.invoke('add-book', data),
  chooseImage: () => ipcRenderer.invoke('choose-img-book'),
  checkBarcode: (barcode) => ipcRenderer.invoke('check-barcode', barcode),
});