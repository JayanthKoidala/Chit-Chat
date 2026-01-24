import {
  Box,
  Button,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  IconButton,
  TextField,
  Drawer,
} from '@mui/material';
import { Search, Notifications, KeyboardArrowDown } from '@mui/icons-material';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setSelectedChat, setChats } from '../../redux/chatSlice';
import ProfileModal from './ProfileModal';

const SideDrawer = () => {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { userInfo } = useSelector((state) => state.user);
  const { chats, notifications } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = async () => {
    if (!search) {
      alert('Please Enter something in search');
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      alert('Error Occurred! Failed to Load the Search Results');
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) dispatch(setChats([data, ...chats]));
      dispatch(setSelectedChat(data));
      setLoadingChat(false);
      setDrawerOpen(false);
    } catch (error) {
      alert('Error fetching the chat');
      setLoadingChat(false);
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bgcolor="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderBottom="1px solid #e0e0e0"
      >
        <Tooltip title="Search Users to chat" placement="bottom-end">
          <Button variant="text" onClick={() => setDrawerOpen(true)} startIcon={<Search />}>
            <Typography sx={{ display: { xs: 'none', md: 'flex' }, px: 1 }}>Search User</Typography>
          </Button>
        </Tooltip>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Chit-Chat
        </Typography>
        <Box display="flex" alignItems="center">
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Notifications />
            {notifications.length > 0 && (
                <Box sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'red', borderRadius: '50%', width: 10, height: 10 }} />
            )}
          </IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar src={userInfo.pic} sx={{ width: 32, height: 32 }} />
            <KeyboardArrowDown />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <ProfileModal user={userInfo}>
                <MenuItem>My Profile</MenuItem>
            </ProfileModal>
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" sx={{ borderBottom: 1, pb: 1, mb: 2 }}>Search Users</Typography>
          <Box display="flex" gap={1} mb={2}>
            <TextField
              size="small"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleSearch}>Go</Button>
          </Box>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            searchResult?.map((user) => (
              <Box
                key={user._id}
                onClick={() => accessChat(user._id)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: '#E8E8E8',
                  '&:hover': { bgcolor: '#38B2AC', color: 'white' },
                  w: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'black',
                  px: 3,
                  py: 2,
                  mb: 2,
                  borderRadius: 'lg',
                }}
              >
                <Avatar src={user.pic} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="body1">{user.name}</Typography>
                  <Typography variant="caption"><b>Email : </b>{user.email}</Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default SideDrawer;
