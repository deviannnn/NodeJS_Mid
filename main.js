const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const mongoose = require('mongoose');
require('dotenv').config();

require('./controllers/book.controller');

const screenPath = path.join(__dirname, 'screens');

function connectDB() {
    try {
        const dbUrl = app.isPackaged ? process.env.DB_PROD_CONSTRING : process.env.DB_DEV_CONSTRING;
        mongoose.connect(dbUrl).then(() => console.log(`Connected to ${app.isPackaged ? 'Production' : 'Development'} DB!`));
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
}

let win;

function createWindow() {
    win = new BrowserWindow({
        titleBarStyle: "hidden",
        titleBarOverlay: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });
    win.maximize();

    ipcMain.on('go-to-screen', (event, screen) => {
        win.loadFile(path.join(screenPath, `${screen}.html`));
    });

    win.loadFile(path.join(screenPath, 'new-book.html'));
}

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