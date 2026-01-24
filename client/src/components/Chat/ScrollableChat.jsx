import { Avatar, Tooltip, Typography, Box } from '@mui/material';
import ScrollableFeed from 'react-scrollable-feed';
import { useSelector } from 'react-redux';

const ScrollableChat = ({ messages }) => {
  const { userInfo } = useSelector((state) => state.user);

  const isSameSender = (messages, m, i, userId) => {
    return (
      i < messages.length - 1 &&
      (messages[i + 1].sender._id !== m.sender._id ||
        messages[i + 1].sender._id === undefined) &&
      messages[i].sender._id !== userId
    );
  };

  const isLastMessage = (messages, i, userId) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender._id !== userId &&
      messages[messages.length - 1].sender._id
    );
  };

  const isSameSenderMargin = (messages, m, i, userId) => {
    if (
      i < messages.length - 1 &&
      messages[i + 1].sender._id === m.sender._id &&
      messages[i].sender._id !== userId
    )
      return 33;
    else if (
      (i < messages.length - 1 &&
        messages[i + 1].sender._id !== m.sender._id &&
        messages[i].sender._id !== userId) ||
      (i === messages.length - 1 && messages[i].sender._id !== userId)
    )
      return 0;
    else return 'auto';
  };

  const isSameUser = (messages, m, i) => {
    return i > 0 && messages[i - 1].sender._id === m.sender._id;
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: 'flex' }} key={m._id}>
            {(isSameSender(messages, m, i, userInfo._id) ||
              isLastMessage(messages, i, userInfo._id)) && (
              <Tooltip title={m.sender.name} placement="bottom-start">
                <Avatar
                  sx={{ mr: 1, mt: 1, width: 28, height: 28, cursor: 'pointer' }}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === userInfo._id ? '#1d69ff' : 'white'
                }`,
                color: `${m.sender._id === userInfo._id ? 'white' : '#1e293b'}`,
                marginLeft: isSameSenderMargin(messages, m, i, userInfo._id),
                marginTop: isSameUser(messages, m, i) ? 4 : 12,
                borderRadius: m.sender._id === userInfo._id ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                padding: '8px 16px',
                maxWidth: '70%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                position: 'relative'
              }}
            >
              {m.fileUrl && m.fileType === 'image' && (
                <Box 
                  component="img" 
                  src={m.fileUrl} 
                  alt="Sent image"
                  sx={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    borderRadius: 1,
                    mb: m.content ? 1 : 0,
                    cursor: 'pointer',
                    display: 'block'
                  }}
                  onClick={() => window.open(m.fileUrl, '_blank')}
                />
              )}
              {m.fileUrl && m.fileType === 'doc' && (
                <Box 
                  sx={{ 
                    bgcolor: 'rgba(0,0,0,0.05)', 
                    p: 1, 
                    borderRadius: 1, 
                    mb: m.content ? 1 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Typography variant="caption" color="inherit">📎 Document</Typography>
                  <Button 
                    size="small" 
                    variant="text" 
                    sx={{ textTransform: 'none', color: m.sender._id === userInfo._id ? 'white' : 'primary.main', p: 0 }}
                    onClick={() => window.open(m.fileUrl, '_blank')}
                  >
                    Download
                  </Button>
                </Box>
              )}
              {m.content && (
                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                    {m.content}
                </Typography>
              )}
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="flex-end" 
                gap={0.5} 
                mt={0.5}
                sx={{ opacity: 0.7 }}
              >
                <Typography variant="caption" sx={{ fontSize: '9px' }}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
                {m.sender._id === userInfo._id && (
                    <Typography component="span" sx={{ fontSize: '10px', display: 'flex' }}>
                        {m.status === 'seen' ? (
                            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✓✓</span>
                        ) : m.status === 'delivered' ? (
                            '✓✓'
                        ) : (
                            '✓'
                        )}
                    </Typography>
                )}
              </Box>
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
