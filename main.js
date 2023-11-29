const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require('electron-store');
const path = require("path");

require('dotenv').config();
require('./controllers/book.controller');
require('./controllers/account.controller');

const store = new Store();

const { connectDB } = require('./utils');

global.screenPath = path.join(__dirname, 'screens');
global.win;

function createWindow() {
    global.win = new BrowserWindow({
        titleBarStyle: "hidden",
        titleBarOverlay: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // First screen
    global.win.loadFile(path.join(global.screenPath, 'login.html'));
}

ipcMain.on('go-to-screen', (event, screen) => {
    const storedAccount = store.get('loggedInAccount');

    if (screen === 'pos') {
        return global.win.loadFile(path.join(global.screenPath, `${screen}.html`));
    }

    if (storedAccount) {
        switch (storedAccount.role) {
            case 'staff':
                return global.win.loadFile(path.join(global.screenPath, 'staff', `${screen}.html`));

            case 'admin':
                return global.win.loadFile(path.join(global.screenPath, 'admin', `${screen}.html`));
        }
    }
});

app.whenReady().then(() => {
    connectDB();
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});