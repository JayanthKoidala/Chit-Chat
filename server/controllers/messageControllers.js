const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'name pic email')
            .populate('chat');
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

const sendMessage = async (req, res) => {
    const { content, chatId, fileUrl, fileType } = req.body;

    if ((!content && !fileUrl) || !chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        fileUrl: fileUrl,
        fileType: fileType,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate('sender', 'name pic');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email',
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

const markAsSeen = async (req, res) => {
    const { chatId } = req.body;

    try {
        await Message.updateMany(
            { chat: chatId, sender: { $ne: req.user._id }, status: { $ne: 'seen' } },
            { $set: { status: 'seen' }, $addToSet: { readBy: req.user._id } }
        );

        res.status(200).json({ message: 'Messages marked as seen' });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

module.exports = { allMessages, sendMessage, markAsSeen };
