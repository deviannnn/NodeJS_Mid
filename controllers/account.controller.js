const { ipcMain } = require('electron');
const path = require("path");
const bcrypt = require('bcrypt');

const Account = require('../models/account.model');

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

        return { success: true, account: { staffId: account.staffId, role: account.role, avatar: account.avatar, name: account.name } };
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

async function copyFileToDirectory(sourcePath, targetDirectory) {
    try {
        await fss.mkdir(targetDirectory, { recursive: true });

        const targetFileName = `account_${Date.now()}${path.extname(sourcePath)}`;
        const targetPath = path.join(targetDirectory, targetFileName);

        await fss.copyFile(sourcePath, targetPath);

        return targetFileName;
    } catch (error) {
        return null;
    }
}