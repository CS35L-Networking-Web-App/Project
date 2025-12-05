import { Router } from 'express';
import { z } from 'zod';
import Message from '../models/message.js';
import User from '../models/user.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Simple zod schema for message body
const sendMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});

// All routes require auth
router.use(authenticate);


// Returns list of conversations for current user.
// Each item: { user: {...}, lastMessage: {...} }
router.get('/conversations', async (req, res) => {
  try {
    const currentUserId = req.userId;

    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('sender', 'name email position location profilePicture')
      .populate('recipient', 'name email position location profilePicture')
      .exec();

    const conversationsMap = new Map();

    for (const msg of messages) {
      const isSender = msg.sender._id.toString() === currentUserId.toString();
      const otherUser = isSender ? msg.recipient : msg.sender;
      const key = otherUser._id.toString();

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          user: {
            id: otherUser._id.toString(),
            name: otherUser.name,
            email: otherUser.email,
            position: otherUser.position,
            location: otherUser.location,
            profilePicture: otherUser.profilePicture,
          },
          lastMessage: {
            id: msg._id.toString(),
            text: msg.text,
            createdAt: msg.createdAt,
            isMine: isSender,
            readAt: msg.readAt,
          },
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());
    res.json({ conversations });
  } catch (err) {
    console.error('GET /api/messages/conversations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Returns full message history with a specific user.
router.get('/:userId', async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    res.json({ messages });
  } catch (err) {
    console.error('GET /api/messages/:userId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sends a new message to :userId
router.post('/:userId', async (req, res) => {
  try {
    const senderId = req.userId;
    const { userId: recipientId } = req.params;

    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      text: parsed.data.text.trim(),
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error('POST /api/messages/:userId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
