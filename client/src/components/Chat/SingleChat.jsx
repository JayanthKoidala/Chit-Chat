import { useEffect, useState } from 'react';
import { Box, Typography, IconButton, TextField, CircularProgress, Stack, Button, ButtonGroup, Avatar, Tooltip } from '@mui/material';
import { ArrowLeft, Send, Paperclip, MoreVertical, Users } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedChat } from '../../redux/chatSlice';
import axios from 'axios';
import { getSocket } from '../../socket';
import ScrollableChat from './ScrollableChat';
import { setNotifications } from '../../redux/chatSlice';

const ENDPOINT = import.meta.env.VITE_API_URL;
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);


  const { userInfo } = useSelector((state) => state.user);
  const { selectedChat, notifications } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const markAsSeen = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/message/seen`, { chatId: selectedChat._id }, config);
      
      const sender = getSender(userInfo, selectedChat.users);
      socket.emit('message read', { 
        chatId: selectedChat._id, 
        userId: userInfo._id, 
        senderId: sender._id 
      });
    } catch (error) {
      console.log('Error marking messages as seen');
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);

      socket.emit('join chat', selectedChat._id);
      
      // Clear notifications for this chat
      dispatch(setNotifications(notifications.filter(n => n.chat._id !== selectedChat._id)));

      // Mark as seen
      markAsSeen();
    } catch (error) {
      console.log('Error fetching messages');
    }
  };

  const sendMessage = async (event, fileUrl = null, fileType = 'text') => {
    if ((event.key === 'Enter' || event.type === 'click') && (newMessage || fileUrl)) {
      socket.emit('stop typing', selectedChat._id);
      try {
        const config = {
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
            fileUrl,
            fileType,
          },
          config
        );
        socket.emit('new message', data);
        setNewMessage('');
        setMessages([...messages, data]);
        // Update local chat list order
        dispatch(setNotifications([...notifications])); // Trigger re-render or similar if needed
      } catch (error) {
        console.log('Error sending message');
      }
    }
  };

  useEffect(() => {
    socket = getSocket();
    socket.emit('setup', userInfo);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
    
    socket.on('messages seen', ({ chatId, userId }) => {
        if (selectedChatCompare && selectedChatCompare._id === chatId) {
            setMessages((prev) => 
                prev.map((m) => m.sender._id !== userId ? { ...m, status: 'seen' } : m)
            );
        }
    });

    return () => {
        // Shared socket should not be disconnected here
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    const handleNewMessage = (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        // Notification logic here
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
        // Also mark as seen if the chat is open
        markAsSeen();
      }
    };
    
    socket.on('message recieved', handleNewMessage);
    
    return () => {
      socket.off('message recieved', handleNewMessage);
    };
  }, []);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };


  const getSender = (loggedUser, users) => {
    return users[0]?._id === loggedUser?._id ? users[1] : users[0];
  };

  const uploadFile = (file) => {
    if (!file) return;
    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    data.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    const type = file.type.startsWith('image/') ? 'image' : 'doc';

    fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
      method: 'post',
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        sendMessage({ type: 'click' }, data.url.toString(), type);
        setLoading(false);
      })
      .catch((err) => {
        console.log('File upload failed');
        setLoading(false);
      });
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {selectedChat ? (
        <>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              px: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e2e8f0',
              bgcolor: 'white'
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton 
                onClick={() => dispatch(setSelectedChat(null))}
                sx={{ display: { md: 'none' } }}
              >
                <ArrowLeft size={20} />
              </IconButton>
              <Avatar 
                src={!selectedChat.isGroupChat ? getSender(userInfo, selectedChat.users).pic : ''} 
                sx={{ width: 40, height: 40 }}
              >
                {selectedChat.isGroupChat && <Users size={20} />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="700">
                  {!selectedChat.isGroupChat
                    ? getSender(userInfo, selectedChat.users).name
                    : selectedChat.chatName}
                </Typography>
                <Typography variant="caption" color="success.main">
                   {!selectedChat.isGroupChat ? getSender(userInfo, selectedChat.users).status || 'offline' : 'group'}
                </Typography>
              </Box>
            </Box>

          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflowY: 'auto',
              bgcolor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {loading ? (
              <CircularProgress sx={{ m: 'auto' }} />
            ) : (
              <ScrollableChat messages={messages} />
            )}
            {istyping && (
              <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                Typing...
              </Typography>
            )}
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, px: 3, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={(e) => uploadFile(e.target.files[0])}
              />
              <label htmlFor="file-upload">
                <IconButton component="span" size="small" sx={{ color: '#64748b' }}>
                  <Paperclip size={20} />
                </IconButton>
              </label>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={sendMessage}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f1f5f9',
                    border: 'none',
                    '& fieldset': { border: 'none' },
                    borderRadius: 3,
                  },
                }}
              />
              <IconButton 
                onClick={sendMessage}
                sx={{ 
                  bgcolor: '#1d69ff', 
                  color: 'white',
                  '&:hover': { bgcolor: '#1558d6' }
                }}
              >
                <Send size={20} />
              </IconButton>
            </Box>
          </Box>
        </>
      ) : (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          sx={{ bgcolor: '#f8fafc' }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              bgcolor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              color: '#1d69ff',
              boxShadow: '0 8px 30px rgba(29, 105, 255, 0.1)'
            }}
          >
            <Users size={56} />
          </Box>
          <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#1e293b' }}>
            Welcome to Chit Chat
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
            Select a conversation to start chatting
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;
