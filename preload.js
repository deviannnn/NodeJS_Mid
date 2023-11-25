const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('changeScreenAPI', {
  goToScreen: (screen) => ipcRenderer.send('go-to-screen', screen),
});

contextBridge.exposeInMainWorld('bookAPI', {
  getAll: () => ipcRenderer.invoke('get-all-book'),
  get: (barcode) => ipcRenderer.invoke('get-book', barcode),
  add: (data) => ipcRenderer.invoke('add-book', data),
  edit: (data) => ipcRenderer.invoke('edit-book', data),
  delete: (barcode) => ipcRenderer.invoke('delete-book', barcode),
  find: (keyword) => ipcRenderer.invoke('find-book', keyword),
  chooseImage: () => ipcRenderer.invoke('choose-img-book'),
  checkBarcode: (barcode) => ipcRenderer.invoke('check-barcode', barcode),
});