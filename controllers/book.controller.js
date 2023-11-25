const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const fss = require('fs').promises;
const path = require('path');

const Book = require('../models/book.model');

ipcMain.handle('get-all-book', async () => {
    try {
        const books = await Book.find();
        return { success: true, books: books };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-book', async (event, barcode) => {
    try {
        const existingBook = await Book.findOne({ barcode });
        if (!existingBook) {
            return ({ success: false, message: 'Book not found.' });
        }

        return { success: true, book: existingBook };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-book', async (event, barcode) => {
    try {
        const existingBook = await Book.findOneAndDelete({ barcode });
        if (!existingBook) {
            return ({ success: false, message: 'Book not found.' });
        }

        const imgPath = path.join(__dirname, '..', 'assets/uploads/book', existingBook.img);
        await fss.unlink(imgPath);

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-book', async (event, data) => {
    try {
        const targetImagePath = await copyFileToDirectory(
            data.img,
            path.join(__dirname, '..', 'assets/uploads/book')
        );

        const imgPath = targetImagePath || 'default-book.png';

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
        return { success: false, message: error.message };
    }
});

ipcMain.handle('edit-book', async (event, data) => {
    try {
        const existingBook = await Book.findOne({ barcode: data.barcode });

        if (!existingBook) {
            return { success: false, message: 'Book not found.' };
        }

        let imgPath = data.img;
        if (imgPath !== existingBook.img) {
            const targetImagePath = await copyFileToDirectory(
                data.img,
                path.join(__dirname, '..', 'assets/uploads/book')
            );
            imgPath = targetImagePath || 'default-book.png';
        }

        const updatedBook = await Book.findOneAndUpdate(
            { barcode: data.barcode },
            {
                $set: {
                    barcode: data.newbarcode,
                    category: data.category,
                    title: data.title,
                    author: data.author,
                    publication: {
                        publisher: data.publisher,
                        year: data.year,
                    },
                    img: imgPath,
                    price: data.price,
                    updated: new Date()
                }
            },
            { new: true }
        );

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
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
        return { success: false, message: error.message };
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