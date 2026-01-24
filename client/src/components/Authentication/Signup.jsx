import { useState } from 'react';
import { TextField, Button, Box, Alert, IconButton, InputAdornment, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmpassword, setConfirmpassword] = useState('');
  const [password, setPassword] = useState('');
  const [pic, setPic] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => setShow(!show);

  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) {
      setError('Please Select an Image!');
      setLoading(false);
      return;
    }
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
    } else {
      setError('Please Select an Image!');
      setLoading(false);
      return;
    }
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      setError('Please Fill all the Fields');
      setLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      setError('Passwords Do Not Match');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user`,
        { name, email, password, pic },
        config
      );
      dispatch(setUser(data));
      navigate('/chats');
    } catch (error) {
      setError(error.response.data.message || 'Error Occured!');
    }
    setLoading(false);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} textAlign="left">
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
          Profile Picture
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #d1d5db',
              overflow: 'hidden',
            }}
          >
            {pic ? (
              <img src={pic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Typography variant="caption" color="text.secondary">PIC</Typography>
            )}
          </Box>
          <Box>
            <Box display="flex" gap={1}>
              <Button
                component="label"
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#d1d5db' }}
              >
                {pic ? 'Change Photo' : 'Upload Photo'}
                <input type="file" hidden onChange={(e) => postDetails(e.target.files[0])} />
              </Button>
              {pic && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => setPic(null)}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Remove
                </Button>
              )}
            </Box>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              JPG, PNG or GIF (max 5MB)
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
          Full Name
        </Typography>
        <TextField
          placeholder="Enter your full name"
          variant="outlined"
          fullWidth
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f3f4f6',
              border: 'none',
              '& fieldset': { border: 'none' },
              borderRadius: 2,
            },
          }}
        />
      </Box>

      <Box>
        <Typography variant="caption" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
          Email
        </Typography>
        <TextField
          placeholder="Enter your email"
          variant="outlined"
          fullWidth
          size="small"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f3f4f6',
              border: 'none',
              '& fieldset': { border: 'none' },
              borderRadius: 2,
            },
          }}
        />
      </Box>

      <Box>
        <Typography variant="caption" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
          Password
        </Typography>
        <TextField
          placeholder="Create a password"
          variant="outlined"
          type={show ? 'text' : 'password'}
          fullWidth
          size="small"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f3f4f6',
              border: 'none',
              '& fieldset': { border: 'none' },
              borderRadius: 2,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClick} edge="end" size="small">
                  {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box>
        <Typography variant="caption" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
          Confirm Password
        </Typography>
        <TextField
          placeholder="Confirm your password"
          variant="outlined"
          type={show ? 'text' : 'password'}
          fullWidth
          size="small"
          value={confirmpassword}
          onChange={(e) => setConfirmpassword(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f3f4f6',
              border: 'none',
              '& fieldset': { border: 'none' },
              borderRadius: 2,
            },
          }}
        />
      </Box>

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={submitHandler}
        disabled={loading}
        sx={{
          bgcolor: '#1d69ff',
          '&:hover': { bgcolor: '#1558d6' },
          textTransform: 'none',
          fontWeight: '600',
          borderRadius: 2,
          py: 1.5,
          mt: 1,
        }}
      >
        Sign Up
      </Button>
    </Box>
  );
};

export default Signup;
