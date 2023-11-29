const { ipcMain } = require('electron');
const Store = require('electron-store');
const path = require("path");
const bcrypt = require('bcrypt');

const store = new Store();

const Account = require('../models/account.model');
const { generateMemberCode } = require('../utils');

ipcMain.handle('login', async (event, data) => {
    try {
        const account = await Account.findOne({ email: data.email });

        if (!account || !bcrypt.compareSync(data.password, account.password)) {
            return { success: false, message: 'Invalid email or password.' };
        }
        if (account.lock) {
            return { success: false, message: 'Your account has been locked.' };
        }
        if (account.status === 'inactived') {
            return { success: false, message: 'Your account hasn\'t been actived.' };
        }

        store.set('loggedInAccount', account);

        global.win.loadFile(path.join(global.screenPath, `${account.role}`, 'book-list.html'));
        global.win.maximize();

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.on('logout', (event) => {
    store.clear();
    global.win.unmaximize();
    return global.win.loadFile(path.join(global.screenPath, 'login.html'));
});

ipcMain.handle('get-logged-account', (event) => {
    const account = store.get('loggedInAccount', null);
    return account;
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

ipcMain.handle('delete-account', async (event, staffId) => {
    try {
        const existingAccount = await Account.findOneAndDelete({ staffId });

        if (!existingAccount) {
            return ({ success: false, message: 'Account not found.' });
        }

        return { success: true, title: 'Deleted!', message: 'This account has been deleted.' };
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
            address: {
                num: data.num,
                street: data.street,
                ward: data.ward,
                district: data.district,
                city: data.city
            },
            avatar: 'default.png'
        };

        await Account.create(accountData);

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('edit-info-account', async (event, data) => {
    try {
        const updatedAccount = await Account.findOneAndUpdate(
            { staffId: data.staffId },
            {
                $set: {
                    email: data.email,
                    name: data.name,
                    gender: data.gender,
                    birthday: data.birthday,
                    phone: data.phone,
                    address: {
                        num: data.num,
                        street: data.street,
                        ward: data.ward,
                        district: data.district,
                        city: data.city
                    },
                    updated: new Date()
                }
            },
            { new: true }
        );

        if (!updatedAccount) {
            return { success: false, message: 'Account not found.' };
        }

        return { success: true, title: 'Updated!', message: 'Information about this account has been changed.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('toggle-lock-account', async (event, staffId) => {
    try {
        const existingAccount = await Account.findOne({ staffId });

        if (!existingAccount) {
            return ({ success: false, message: 'Account not found.' });
        }

        const updatedAccount = await Account.findOneAndUpdate(
            { staffId },
            {
                $set: {
                    lock: !existingAccount.lock,
                    updated: new Date()
                }
            },
            { new: true }
        );

        return { success: true, title: `${updatedAccount.lock ? 'Locked!' : 'Unlocked!'}`, message: 'Locked status of this account has been changed.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('change-pw-account', async (event, data) => {
    try {
        const existingAccount = await Account.findOne({ staffId: data.staffId });

        if (!existingAccount) {
            return ({ success: false, message: 'Account not found.' });
        }

        if (!data.curPassword || !bcrypt.compareSync(data.curPassword, existingAccount.password)) {
            return ({ success: false, curPwErr: true, message: 'Current password is incorrect.' });
        }

        const updatedAccount = await Account.findOneAndUpdate(
            { staffId: existingAccount.staffId },
            {
                $set: {
                    password: bcrypt.hashSync(data.newPassword, 10),
                    updated: new Date()
                }
            },
            { new: true }
        );

        return { success: true, title: 'Updated!', message: 'Your password has been changed.' };
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