const { app } = require("electron");
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

const connectDB = () => {
    try {
        const dbUrl = app.isPackaged ? process.env.DB_PROD_CONSTRING : process.env.DB_DEV_CONSTRING;
        mongoose.connect(dbUrl).then(() => console.log(`Connected to ${app.isPackaged ? 'Production' : 'Development'} DB!`));
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
}

const copyFileToDirectory = async (type, sourcePath) => {
    try {
        const targetDirectory = path.join(__dirname, 'assets/uploads', type);
        
        await fs.mkdir(targetDirectory, { recursive: true });

        const targetFileName = `${type}_${Date.now()}${path.extname(sourcePath)}`;
        const targetPath = path.join(targetDirectory, targetFileName);

        await fs.copyFile(sourcePath, targetPath);

        return targetFileName;
    } catch (error) {
        return null;
    }
}

const generateMemberCode = () => {
    const timestamp = new Date().getTime().toString();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${timestamp}-${randomNum}`;
}

module.exports = { connectDB, copyFileToDirectory, generateMemberCode }