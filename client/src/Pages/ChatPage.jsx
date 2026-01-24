import { Box } from '@mui/material';
import MyChats from '../components/Chat/MyChats';
import ChatBox from '../components/Chat/ChatBox';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSocket } from '../socket';
import { addChat, updateLatestMessage, setNotifications, updateUserStatus } from '../redux/chatSlice';

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { userInfo } = useSelector((state) => state.user);
  const { selectedChat, notifications } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userInfo) return;
    
    const socket = getSocket();
    socket.emit('setup', userInfo);

    const handleMessageRecieved = (newMessageRecieved) => {
      // Update chat list
      dispatch(updateLatestMessage({
        chatId: newMessageRecieved.chat._id,
        message: newMessageRecieved
      }));

      // If not selected chat, add to notifications
      if (!selectedChat || selectedChat._id !== newMessageRecieved.chat._id) {
        if (!notifications.find(n => n._id === newMessageRecieved._id)) {
          dispatch(setNotifications([newMessageRecieved, ...notifications]));
        }
      }
    };

    const handleChatCreated = (newChat) => {
        dispatch(addChat(newChat));
    };

    const handleUserStatus = ({ userId, status }) => {
        dispatch(updateUserStatus({ userId, status }));
    };

    socket.on('message recieved', handleMessageRecieved);
    socket.on('chat created', handleChatCreated);
    socket.on('user status', handleUserStatus);

    return () => {
      socket.off('message recieved', handleMessageRecieved);
      socket.off('chat created', handleChatCreated);
      socket.off('user status', handleUserStatus);
    };
  }, [selectedChat, notifications, userInfo]);

  return (
    <Box 
      display="flex" 
      sx={{ 
        width: '100%', 
        height: '100vh', 
        bgcolor: '#f8fafc',
        overflow: 'hidden' 
      }}
    >
      {userInfo && <MyChats fetchAgain={fetchAgain} />}
      <Box flex={1} height="100%">
        {userInfo && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
