import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import { X, Users, Check } from 'lucide-react';
import axios from 'axios';
import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setChats } from '../../redux/chatSlice';
import { debounce } from 'lodash';
import { getSocket } from '../../socket';

const GroupChatModal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { userInfo } = useSelector((state) => state.user);
  const { chats } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearch('');
    setSearchResult([]);
    setSelectedUsers([]);
    setGroupChatName('');
  };

  const fetchUsers = async (query) => {
    if (!query) {
      setSearchResult([]);
      return;
    }
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

  const debouncedSearch = useCallback(
    debounce((nextValue) => fetchUsers(nextValue), 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleToggleUser = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      alert('Please fill all the fields and select at least 2 other users');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      dispatch(setChats([data, ...chats]));
      
      const socket = getSocket();
      socket.emit('new chat', data);

      handleClose();
    } catch (error) {
      alert('Failed to Create the Chat!');
    }
  };

  // Combine results: selected users on top, followed by search results
  const displayedUsers = [
    ...selectedUsers,
    ...searchResult.filter((s) => !selectedUsers.find((u) => u._id === s._id)),
  ];

  return (
    <>
      <span onClick={handleOpen}>{children}</span>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1d69ff', fontWeight: '800' }}>
            <Box display="flex" alignItems="center" gap={1}>
                <Users size={24} />
                <Typography variant="h6" fontWeight="800">Create New Group</Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
                <X size={20} />
            </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Group Name
            </Typography>
            <TextField
              placeholder="Enter group name"
              fullWidth
              size="small"
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                }
              }}
            />
          </Box>
          <Box>
            <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Add Members
            </Typography>
            <TextField
              placeholder="Search users..."
              fullWidth
              size="small"
              value={search}
              onChange={handleSearchChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                }
              }}
            />
            
            <Box 
                sx={{ 
                    mt: 2, 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '10px',
                    bgcolor: 'white'
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}><CircularProgress size={24} /></Box>
                ) : displayedUsers.length > 0 ? (
                    <List sx={{ p: 0 }}>
                        {displayedUsers.map((user, index) => {
                            const isSelected = selectedUsers.find(u => u._id === user._id);
                            return (
                                <Box key={user._id}>
                                    <ListItem disablePadding>
                                        <ListItemButton 
                                            onClick={() => handleToggleUser(user)}
                                            sx={{ py: 1.5 }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={user.pic} sx={{ width: 36, height: 36 }} />
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={<Typography variant="subtitle2" fontWeight="700">{user.name}</Typography>}
                                                secondary={<Typography variant="caption" color="text.secondary">{user.email}</Typography>}
                                            />
                                            <Checkbox 
                                                checked={!!isSelected}
                                                size="small"
                                                icon={<Box sx={{ width: 18, height: 18, border: '1px solid #cbd5e1', borderRadius: '4px' }} />}
                                                checkedIcon={<Box sx={{ width: 18, height: 18, bgcolor: '#1d69ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="white" /></Box>}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    {index < displayedUsers.length - 1 && <Divider component="li" />}
                                </Box>
                            )
                        })}
                    </List>
                ) : (
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', p: 4, color: 'text.secondary' }}>
                        {search ? 'No users found' : 'Search users to add to group'}
                    </Typography>
                )}
            </Box>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                {selectedUsers.length} members selected
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button onClick={handleClose} variant="text" sx={{ color: 'text.primary', textTransform: 'none', fontWeight: '600' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            sx={{ 
                bgcolor: '#1d69ff', 
                borderRadius: '10px', 
                textTransform: 'none', 
                fontWeight: '600',
                px: 4,
                boxShadow: '0 4px 14px 0 rgba(29,105,255,0.39)'
            }}
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupChatModal;
