import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { getCurrentUser, getUserById, getConversations, getMessagesWith, sendMessageTo } from './api.js';
import './styles.css';

const default_pfp = "https://cpng.pikpng.com/pngl/s/80-805068_my-profile-icon-blank-profile-picture-circle-clipart.png";

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectUserId = searchParams.get('user') || null;

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Load current user + conversations on mount
  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        await loadConversations(user, preselectUserId);
      } catch (err) {
        console.error('Failed to load messages page:', err);
        alert(err.message);
        navigate('/'); // back to login if token invalid
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadConversations(user, preselectId) {
    setLoadingConversations(true);
    try {
      const data = await getConversations();
      const convos = data.conversations || [];
      setConversations(convos);

      if (preselectId) {
        const inList = convos.find(c => c.user.id === preselectId);
        if (inList) {
          setActiveUser(inList.user);
          return;
        }
        // Not in list yet (no prior messages) → fetch user info
        try {
          const u = await getUserById(preselectId);
          setActiveUser({
            id: u.id,
            name: u.name,
            email: u.email,
            position: u.position,
            location: u.location,
            profilePicture: u.profilePicture,
          });
        } catch (err) {
          console.error('Failed to preselect user:', err);
        }
      } else if (convos.length > 0) {
        setActiveUser(convos[0].user);
      }
    } finally {
      setLoadingConversations(false);
    }
  }

  // Load messages when activeUser changes
  useEffect(() => {
    if (!activeUser) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        setLoadingMessages(true);
        const data = await getMessagesWith(activeUser.id);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to load messages:', err);
        alert(err.message);
      } finally {
        setLoadingMessages(false);
      }
    })();
  }, [activeUser]);

  async function handleSend(e) {
    e.preventDefault();
    if (!newText.trim() || !activeUser || !currentUser) return;

    setSending(true);
    try {
      const data = await sendMessageTo(activeUser.id, newText.trim());
      const msg = data.message;
      setMessages(prev => [...prev, msg]);
      setNewText('');

      // Refresh conversations list to update lastMessage previews
      await loadConversations(currentUser, activeUser.id);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f3f2ef' }}>
      {/* Top bar */}
      <Box
        sx={{
          height: 64,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#ffffff',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
          Direct Messages
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate('/home')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Back to Home
        </Button>
      </Box>

      {/* Main layout */}
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 64px)',
        }}
      >
        {/* Conversations list */}
        <Box
          sx={{
            width: 320,
            borderRight: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            overflowY: 'auto',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}
            >
              Conversations
            </Typography>
            {loadingConversations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : conversations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No conversations yet. Open a profile and click “Message” to start a chat.
              </Typography>
            ) : (
              <List disablePadding>
                {conversations.map(({ user, lastMessage }) => (
                  <ListItem
                    key={user.id}
                    disablePadding
                    secondaryAction={null}
                  >
                    <ListItemButton
                      onClick={() => setActiveUser(user)}
                      selected={activeUser && activeUser.id === user.id}
                      sx={{ alignItems: 'flex-start', py: 1.2 }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={
                            user.profilePicture && user.profilePicture.trim() !== ''
                              ? user.profilePicture
                              : default_pfp
                          }
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                            {user.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            sx={{ fontSize: '0.8rem', color: '#5f6368' }}
                            noWrap
                          >
                            {lastMessage?.text || ''}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* Chat window */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeUser ? (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5f6368',
              }}
            >
              <Typography variant="body1">
                Select a conversation or open someone&apos;s profile and click &quot;Message&quot;.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Chat header */}
              <Box
                sx={{
                  px: 3,
                  py: 1.5,
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Avatar
                  src={
                    activeUser.profilePicture &&
                    activeUser.profilePicture.trim() !== ''
                      ? activeUser.profilePicture
                      : default_pfp
                  }
                />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    {activeUser.name}
                  </Typography>
                  <Typography
                    sx={{ fontSize: '0.8rem', color: '#5f6368' }}
                    noWrap
                  >
                    {activeUser.position}
                    {activeUser.location && ` • ${activeUser.location}`}
                  </Typography>
                </Box>
              </Box>

              {/* Messages list */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  backgroundColor: '#f3f2ef',
                }}
              >
                {loadingMessages ? (
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No messages yet. Say hi!
                    </Typography>
                  </Box>
                ) : (
                  messages.map((m) => {
                    const isMine =
                      currentUser && m.sender === currentUser.id;
                    return (
                      <Box
                        key={m._id}
                        sx={{
                          display: 'flex',
                          justifyContent: isMine ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            px: 1.5,
                            py: 1,
                            borderRadius: 2,
                            backgroundColor: isMine ? '#0066cc' : '#ffffff',
                            color: isMine ? '#ffffff' : '#1a1a1a',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                          }}
                        >
                          <Typography sx={{ fontSize: '0.9rem' }}>
                            {m.text}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.7rem',
                              opacity: 0.7,
                              textAlign: 'right',
                              mt: 0.3,
                            }}
                          >
                            {new Date(m.createdAt).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>

              <Divider />

              {/* Input box */}
              <Box
                component="form"
                onSubmit={handleSend}
                sx={{
                  p: 1.5,
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  borderTop: '1px solid #e0e0e0',
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={sending || !newText.trim()}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Send
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
