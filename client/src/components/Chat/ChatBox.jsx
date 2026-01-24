import { Box } from '@mui/material';
import SingleChat from './SingleChat';
import { useSelector } from 'react-redux';

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = useSelector((state) => state.chat);

  return (
    <Box
      sx={{
        display: { xs: selectedChat ? 'flex' : 'none', md: 'flex' },
        alignItems: 'center',
        flexDirection: 'column',
        bgcolor: 'white',
        width: '100%',
        height: '100vh',
      }}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
