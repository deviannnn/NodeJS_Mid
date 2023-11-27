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
  import: (data) => ipcRenderer.invoke('import-book', data),
  find: (keyword) => ipcRenderer.invoke('find-book', keyword),
  chooseImage: () => ipcRenderer.invoke('choose-img-book'),
  checkBarcode: (barcode) => ipcRenderer.invoke('check-barcode', barcode),
});

contextBridge.exposeInMainWorld('accountAPI', {
  login: (data) => ipcRenderer.invoke('login', data),
  getAll: () => ipcRenderer.invoke('get-all-account'),
  get: (email) => ipcRenderer.invoke('get-account', email),
  add: (data) => ipcRenderer.invoke('add-account', data),
  edit: (data) => ipcRenderer.invoke('edit-info-account', data),
  delete: (staffId) => ipcRenderer.invoke('delete-account', staffId),
  toggleLock: (staffId) => ipcRenderer.invoke('toggle-lock-account', staffId),
  chooseImage: () => ipcRenderer.invoke('choose-img-account'),
  checkEmail: (email) => ipcRenderer.invoke('check-email', email),
  checkPhone: (phone) => ipcRenderer.invoke('check-phone', phone),
});