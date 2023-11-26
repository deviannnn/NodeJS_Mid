const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    staffId: { type: String, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    birthday: { type: Date, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    avatar: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'staff'], default: 'staff' },
    status: { type: String, required: true, enum: ['inactived', 'actived'], default: 'inactived' },
    lock: { type: Boolean, required: true, default: false },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;