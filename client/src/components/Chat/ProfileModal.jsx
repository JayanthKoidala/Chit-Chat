import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Avatar,
  Box,
  TextField,
} from '@mui/material';
import { Close, Edit } from '@mui/icons-material';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import axios from 'axios';

const ProfileModal = ({ user, children }) => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name);
  const [pic, setPic] = useState(user?.pic);
  const [loading, setLoading] = useState(false);

  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
  };

  const postDetails = (pics) => {
    setLoading(true);
    if (!pics) return;
    if (pics.type === 'image/jpeg' || pics.type === 'image/png') {
      const data = new FormData();
      data.append('file', pics);
      data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      data.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'post',
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/profile`,
        { name, pic },
        config
      );
      dispatch(setUser(data));
      setLoading(false);
      setEditMode(false);
      alert('Profile Updated Successfully');
    } catch (error) {
      alert('Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={handleOpen}>{children}</span>
      ) : (
        <IconButton onClick={handleOpen}>
           <Avatar src={user?.pic} />
        </IconButton>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editMode ? 'Edit Profile' : 'User Profile'}
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Avatar src={pic} sx={{ width: 150, height: 150, mb: 2 }} />
          {editMode ? (
            <>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                type="file"
                fullWidth
                onChange={(e) => postDetails(e.target.files[0])}
                helperText="Change Profile Picture"
              />
            </>
          ) : (
            <>
              <Typography variant="h4">{user?.name}</Typography>
              <Typography variant="body1">Email: {user?.email}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          {editMode ? (
            <Button onClick={handleUpdate} variant="contained" disabled={loading}>
              Save Changes
            </Button>
          ) : (
            userInfo._id === user?._id && (
              <Button onClick={() => setEditMode(true)} startIcon={<Edit />} variant="outlined">
                Edit Profile
              </Button>
            )
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileModal;
