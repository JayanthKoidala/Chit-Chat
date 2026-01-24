import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { Search, UserPlus } from 'lucide-react';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setChats, setSelectedChat } from '../../redux/chatSlice';
import { debounce } from 'lodash';
import { getSocket } from '../../socket';

const AddUserModal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { userInfo } = useSelector((state) => state.user);
  const { chats } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearch('');
    setSearchResult([]);
  };

  const fetchUsers = async (query) => {
    if (!query) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      console.log('Error searching users');
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((nextValue) => fetchUsers(nextValue), 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
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

      if (!chats.find((c) => c._id === data._id)) {
        dispatch(setChats([data, ...chats]));
        // Emit new chat to participant
        const socket = getSocket();
        socket.emit('new chat', data);
      }
      dispatch(setSelectedChat(data));
      setLoadingChat(false);
      handleClose();
    } catch (error) {
      console.log('Error creating chat');
      setLoadingChat(false);
    }
  };

  return (
    <>
      <span onClick={handleOpen}>{children}</span>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '24px', fontWeight: '800', pt: 3 }}>
          Find Someone
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <Box>
            <Typography variant="caption" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
              Search Users
            </Typography>
            <TextField
              placeholder="Search by name or email..."
              fullWidth
              size="small"
              value={search}
              onChange={handleSearchChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f1f5f9',
                  border: 'none',
                  '& fieldset': { border: 'none' },
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                    <Search size={18} />
                  </Box>
                ),
              }}
            />
          </Box>

          <Box sx={{ minHeight: '200px', maxHeight: '350px', overflowY: 'auto' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress size={24} />
              </Box>
            ) : searchResult.length > 0 ? (
              <List sx={{ pt: 0 }}>
                {searchResult.map((user) => (
                  <ListItem disablePadding key={user._id} sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => accessChat(user._id)}
                      disabled={loadingChat}
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        '&:hover': { bgcolor: '#f1f5f9' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={user.pic} sx={{ width: 40, height: 40 }} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="subtitle2" fontWeight="700">{user.name}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">{user.email}</Typography>}
                      />
                      <UserPlus size={18} color="#1d69ff" />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : search && !loading ? (
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                No users found
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                 Start typing to find people...
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} fullWidth variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddUserModal;
