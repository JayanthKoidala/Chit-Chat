import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        selectedChat: null,
        chats: [],
        notifications: [],
    },
    reducers: {
        setSelectedChat: (state, action) => {
            state.selectedChat = action.payload;
        },
        setChats: (state, action) => {
            state.chats = action.payload;
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },
        addChat: (state, action) => {
            if (!state.chats.find((c) => c._id === action.payload._id)) {
                state.chats = [action.payload, ...state.chats];
            }
        },
        updateLatestMessage: (state, action) => {
            const { chatId, message } = action.payload;
            state.chats = state.chats.map((chat) => {
                if (chat._id === chatId) {
                    return { ...chat, latestMessage: message };
                }
                return chat;
            }).sort((a, b) => {
                const dateA = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(a.updatedAt);
                const dateB = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(b.updatedAt);
                return dateB - dateA;
            });
        },
        updateUserStatus: (state, action) => {
            const { userId, status } = action.payload;
            state.chats = state.chats.map((chat) => {
                if (!chat.isGroupChat) {
                    return {
                        ...chat,
                        users: chat.users.map((user) => 
                            user._id === userId ? { ...user, status } : user
                        ),
                    };
                }
                return chat;
            });
            if (state.selectedChat && !state.selectedChat.isGroupChat) {
                state.selectedChat = {
                    ...state.selectedChat,
                    users: state.selectedChat.users.map((user) => 
                        user._id === userId ? { ...user, status } : user
                    ),
                };
            }
        },
        resetChatState: (state) => {
            state.selectedChat = null;
            state.chats = [];
            state.notifications = [];
        },
    },
});

export const { setSelectedChat, setChats, setNotifications, addChat, updateLatestMessage, updateUserStatus, resetChatState } = chatSlice.actions;
export default chatSlice.reducer;
