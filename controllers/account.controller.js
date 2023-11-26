const { ipcMain } = require('electron');
const bcrypt = require('bcrypt');

const Account = require('../models/account.model');

ipcMain.handle('login', async (event, data) => {
    try {

    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-all-account', async () => {
    try {
        const accounts = await Account.find();
        return { success: true, accounts: accounts };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-account', async (event, email) => {
    try {
        const existingAccount = await Account.findOne({ email });
        if (!existingAccount) {
            return ({ success: false, message: 'Account not found.' });
        }

        return { success: true, account: existingAccount };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-account', async (event, data) => {
    try {
        const existingAccount = await Account.findOneAndDelete({ data });
        if (!existingAccount) {
            return ({ success: false, message: 'Account not found.' });
        }

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-account', async (event, data) => {
    try {
        const hashedPassword = bcrypt.hashSync(data.email, 10);

        const accountData = {
            staffId: generateMemberCode(),
            email: data.email,
            password: hashedPassword,
            name: data.name,
            gender: data.gender,
            birthday: data.birthday,
            phone: data.phone,
            address: `${data.num} ${data.street}, Ward ${data.ward}, District ${data.district}, ${data.city} City`,
            avatar: 'default.png'
        };

        await Account.create(accountData);

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('check-email', async (event, email) => {
    try {
        const existing = await Account.findOne({ email });
        return { exists: Boolean(existing) };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('check-phone', async (event, phone) => {
    try {
        const existing = await Account.findOne({ phone });
        return { exists: Boolean(existing) };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

function generateMemberCode() {
    const timestamp = new Date().getTime().toString();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${timestamp}-${randomNum}`;
}