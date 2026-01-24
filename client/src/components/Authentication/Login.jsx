import { useState } from 'react';
import { TextField, Button, Box, Alert, IconButton, InputAdornment, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      setError('Please Fill all the Fields');
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
        `${import.meta.env.VITE_API_URL}/api/user/login`,
        { email, password },
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
    <Box display="flex" flexDirection="column" gap={2.5} textAlign="left">
      {error && <Alert severity="error">{error}</Alert>}
      
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
          placeholder="Enter your password"
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
        Sign In
      </Button>
    </Box>
  );
};

export default Login;
