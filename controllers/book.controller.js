const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const fss = require('fs').promises;
const path = require('path');

const Book = require('../models/book.model');

ipcMain.handle('get-books', async () => {
    try {
        const books = await Book.find();
        return books;
    } catch (error) {
        throw new Error('Error fetching books: ' + error.message);
    }
});

ipcMain.handle('add-book', async (event, data) => {
    try {
        const targetImagePath = await copyFileToDirectory(
            data.img,
            path.join(__dirname, '..', 'assets/uploads/book')
        );

        const imgPath = targetImagePath || 'default-image.png';

        const bookData = {
            barcode: data.barcode,
            category: data.category,
            title: data.title,
            author: data.author,
            publication: {
                publisher: data.publisher,
                year: data.year,
            },
            img: imgPath,
            price: data.price
        };

        await Book.create(bookData);

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('choose-img-book', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }] });

    if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });
        const base64Image = `data:image/${filePath.split('.').pop()};base64,${fileContent}`;

        return { filePath, base64Image };
    }

    return null;
});

ipcMain.handle('check-barcode', async (event, barcode) => {
    try {
        const existingBook = await Book.findOne({ barcode });
        return { exists: Boolean(existingBook) };
    } catch (error) {
        throw new Error('Error checking barcode: ' + error.message);
    }
});

async function copyFileToDirectory(sourcePath, targetDirectory) {
    try {
        await fss.mkdir(targetDirectory, { recursive: true });

        const targetFileName = `book_${Date.now()}${path.extname(sourcePath)}`;
        const targetPath = path.join(targetDirectory, targetFileName);

        await fss.copyFile(sourcePath, targetPath);

        return targetFileName;
    } catch (error) {
        return null;
    }
}