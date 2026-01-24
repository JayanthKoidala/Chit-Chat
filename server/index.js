const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');
const cors = require('cors');

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running on PORT ${PORT}...`)
);

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:5173',
        // credentials: true,
    },
});

const User = require('./models/User');

io.on('connection', (socket) => {
    console.log('Connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.userId = userData._id; // Store for disconnect
        User.findByIdAndUpdate(userData._id, { status: 'online' }).then(() => {
             socket.broadcast.emit('user status', { userId: userData._id, status: 'online' });
        });
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User Joined Room: ' + room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing', room));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing', room));

    socket.on('new message', (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log('chat.users not defined');

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            // Check if user is online (joined their own room)
            socket.in(user._id).emit('message recieved', newMessageRecieved);
            
            // Mark as delivered if recipient is online
            // For simplicity in this demo, we'll assume they get it if they are online
            // A more robust way would be a 'delivered' ack from the client
        });
    });

    socket.on('message read', (data) => {
        const { chatId, userId, senderId } = data;
        // Notify the sender that their messages in this chat were read
        socket.in(senderId).emit('messages seen', { chatId, userId });
    });

    socket.on('new chat', (newChat) => {
        if (!newChat.users) return;
        newChat.users.forEach((user) => {
            socket.in(user._id).emit('chat created', newChat);
        });
    });

    socket.on('disconnect', () => {
        if(socket.userId) {
            User.findByIdAndUpdate(socket.userId, { status: 'offline', lastSeen: Date.now() }).then(() => {
                socket.broadcast.emit('user status', { userId: socket.userId, status: 'offline', lastSeen: new Date() });
            });
            console.log('USER DISCONNECTED');
        }
    });
});
