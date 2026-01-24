const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, trim: true },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        fileUrl: { type: String },
        fileType: { type: String, enum: ['image', 'doc', 'text'], default: 'text' },
        status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
