import { Box, Button, Stack, Typography, Avatar, TextField, InputAdornment, IconButton, Badge } from '@mui/material';
import { Plus, Search, Settings, LogOut, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setChats, setSelectedChat, resetChatState } from '../../redux/chatSlice';
import { logout } from '../../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import GroupChatModal from './GroupChatModal';
import AddUserModal from './AddUserModal';
import { disconnectSocket } from '../../socket';

const MyChats = ({ fetchAgain }) => {
  const [search, setSearch] = useState('');
  const { userInfo } = useSelector((state) => state.user);
  const { chats, selectedChat, notifications } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat`, config);
      dispatch(setChats(data));
    } catch (error) {
      console.log('Error loading chats');
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  const logoutHandler = () => {
    disconnectSocket();
    dispatch(resetChatState());
    dispatch(logout());
    navigate('/');
  };

  const getSender = (loggedUser, users) => {
    return users[0]?._id === loggedUser?._id ? users[1]?.name : users[0]?.name;
  };

  const getSenderPic = (loggedUser, users) => {
    return users[0]?._id === loggedUser?._id ? users[1]?.pic : users[0]?.pic;
  };

  const getUnreadCount = (chatId) => {
    return notifications.filter((n) => n.chat._id === chatId).length;
  };

  const filteredChats = chats.filter((chat) => {
    const chatName = !chat.isGroupChat 
      ? getSender(userInfo, chat.users) 
      : chat.chatName;
    return chatName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Box
      sx={{
        display: { xs: selectedChat ? 'none' : 'flex', md: 'flex' },
        flexDirection: 'column',
        bgcolor: 'white',
        width: { xs: '100%', md: '350px' },
        borderRight: '1px solid #e2e8f0',
        height: '100vh',
      }}
    >
      {/* Blue Header Section */}
      <Box sx={{ bgcolor: '#1d69ff', color: 'white', p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar src={userInfo.pic} sx={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.2)' }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="700" lineHeight={1.2}>
                {userInfo.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                online
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={0.5}>
            <IconButton size="small" sx={{ color: 'white', opacity: 0.8 }}>
              <Settings size={18} />
            </IconButton>
            <IconButton size="small" onClick={logoutHandler} sx={{ color: 'white', opacity: 0.8 }}>
              <LogOut size={18} />
            </IconButton>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              border: 'none',
              '& fieldset': { border: 'none' },
              borderRadius: 2,
              '& input::placeholder': { color: 'rgba(255,255,255,0.6)', opacity: 1 },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="rgba(255,255,255,0.6)" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Create Buttons */}
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <AddUserModal>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Plus size={18} />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#e2e8f0',
              color: '#1d69ff',
              bgcolor: '#f0f7ff',
              '&:hover': { bgcolor: '#e0f0ff', borderColor: '#1d69ff' },
              fontWeight: '600'
            }}
          >
            Add User
          </Button>
        </AddUserModal>
        <GroupChatModal>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Users size={18} />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#e2e8f0',
              color: '#475569',
              bgcolor: '#f8fafc',
              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
              fontWeight: '600'
            }}
          >
            Group
          </Button>
        </GroupChatModal>
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Stack spacing={0}>
          {filteredChats.map((chat) => (
            <Box
              key={chat._id}
              onClick={() => dispatch(setSelectedChat(chat))}
              sx={{
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: '0.2s',
                bgcolor: selectedChat?._id === chat._id ? '#f0f7ff' : 'transparent',
                '&:hover': { bgcolor: '#f8fafc' },
                borderLeft: selectedChat?._id === chat._id ? '4px solid #1d69ff' : '4px solid transparent',
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: !chat.isGroupChat && (chat.users[0]?._id === userInfo._id ? chat.users[1] : chat.users[0])?.status === 'online' ? '#44b700' : 'transparent',
                    color: '#44b700',
                    boxShadow: !chat.isGroupChat && (chat.users[0]?._id === userInfo._id ? chat.users[1] : chat.users[0])?.status === 'online' ? `0 0 0 2px white` : 'none',
                    width: 10,
                    height: 10,
                    borderRadius: '50%'
                  }
                }}
              >
                <Avatar 
                  src={!chat.isGroupChat ? getSenderPic(userInfo, chat.users) : ''} 
                  sx={{ bgcolor: chat.isGroupChat ? '#1d69ff' : '#e2e8f0' }}
                >
                  {!chat.isGroupChat ? null : <Users size={20} />}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box display="flex" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="subtitle2" fontWeight="700" noWrap>
                    {!chat.isGroupChat ? getSender(userInfo, chat.users) : chat.chatName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                    {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ flex: 1, mr: 1 }}
                  >
                    {chat.latestMessage ? chat.latestMessage.content : 'No messages yet'}
                  </Typography>
                  {/* Real-time Unread Badge */}
                  {getUnreadCount(chat._id) > 0 && (
                    <Box 
                      sx={{ 
                        bgcolor: '#1d69ff', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: 18, 
                        height: 18, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '700'
                      }}
                    >
                      {getUnreadCount(chat._id)}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default MyChats;
