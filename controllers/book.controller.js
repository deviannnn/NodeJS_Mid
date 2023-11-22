const { ipcMain } = require('electron');
const Book = require('../models/book.model');

ipcMain.handle('get-books', async () => {
    try {
        const books = await Book.find();
        return books;
    } catch (error) {
        throw new Error('Error fetching books: ' + error.message);
    }
});