import { Box } from '@mui/material';
import MyChats from '../components/Chat/MyChats';
import ChatBox from '../components/Chat/ChatBox';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSocket } from '../socket';
import { useRef } from 'react';
import { addChat, updateLatestMessage, updateUserStatus, addNotification } from '../redux/chatSlice';

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { userInfo } = useSelector((state) => state.user);
  const { selectedChat } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  // Keep a ref of selectedChat so listeners can access it without causing re-registration
  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

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

      // Use ref to check if not current chat, then add to notifications
      if (!selectedChatRef.current || selectedChatRef.current._id !== newMessageRecieved.chat._id) {
          dispatch(addNotification(newMessageRecieved));
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
  }, [userInfo, dispatch]); // Only depend on userInfo (and dispatch)

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
