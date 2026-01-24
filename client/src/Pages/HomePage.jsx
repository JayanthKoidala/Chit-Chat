import { useState } from 'react';
import { Box, Container, Typography, Paper, Link } from '@mui/material';
import { MessageCircle } from 'lucide-react';
import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';

const HomePage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#eef6ff',
        p: 2,
        boxSizing: 'border-box'
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Top Icon */}
          <Box
            sx={{
              width: 50,
              height: 50,
              bgcolor: '#1d69ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: 'white',
            }}
          >
            <MessageCircle size={28} />
          </Box>

          <Typography variant="h4" fontWeight="800" gutterBottom>
            Chit Chat
          </Typography>
          <Typography variant="h4" fontWeight="800" gutterBottom>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {isLogin ? 'Sign in to continue chatting' : 'Sign up to start chatting'}
          </Typography>

          {isLogin ? <Login /> : <Signup />}

          <Box mt={3}>
            <Typography variant="body2" color="text.secondary">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => setIsLogin(!isLogin)}
                sx={{ fontWeight: '600', textDecoration: 'none' }}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
