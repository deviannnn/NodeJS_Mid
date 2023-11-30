const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = () => {
    const dbUrl = 'mongodb+srv://admin:admin@lytuanan1911.jtassu8.mongodb.net/StarBook_dev?retryWrites=true&w=majority'
    mongoose.connect(dbUrl);
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