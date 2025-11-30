import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.string().optional(),
  location: z.string().optional(),
  about: z.string().optional(),
  workExperience: z.string().optional(),
  education: z.string().optional(),
  skills: z.string().optional(),
  profilePicture: z.string().optional()
});

// Get all users (for searching)
router.get('/', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q) {
      query = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { position: { $regex: q, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-passwordHash -verificationCode -verificationExpiresAt')
      .limit(50);

    const currentUser = await User.findById(req.userId);

    const usersWithStatus = users.map(user => {
      const isConnection = currentUser.connections.some(id => id.toString() === user._id.toString());
      const hasPendingRequest = user.connectionRequests.some(req => req.from.toString() === currentUser._id.toString());
      const hasReceivedRequest = currentUser.connectionRequests.some(req => req.from.toString() === user._id.toString());

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        position: user.position,
        about: user.about,
        profilePicture: user.profilePicture,
        isConnection,
        hasPendingRequest,
        hasReceivedRequest,
        isSelf: user._id.toString() === req.userId
      };
    });

    res.json({ users: usersWithStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-passwordHash -verificationCode -verificationExpiresAt')
      .populate('followers', 'name email')
      .populate('following', 'name email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      position: user.position,
      location: user.location,
      about: user.about,
      workExperience: user.workExperience,
      education: user.education,
      skills: user.skills,
      profilePicture: user.profilePicture,
      followersCount: user.followers.length,
      followingCount: user.following.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-passwordHash -verificationCode -verificationExpiresAt')
      .populate('followers', 'name email')
      .populate('following', 'name email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(401).json({ error: 'Authenticated user not found' });
    }

    const isConnection = currentUser.connections.some(id => id.toString() === req.params.userId);
    const hasPendingRequest = user.connectionRequests.some(req => req.from.toString() === currentUser._id.toString());
    const hasReceivedRequest = currentUser.connectionRequests.some(req => req.from.toString() === user._id.toString());

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      position: user.position,
      location: user.location,
      about: user.about,
      workExperience: user.workExperience,
      education: user.education,
      skills: user.skills,
      profilePicture: user.profilePicture,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing: currentUser.following.some(id => id.toString() === req.params.userId),
      isConnection,
      hasPendingRequest,
      hasReceivedRequest
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/me', authenticate, async (req, res) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (parsed.data.name !== undefined) user.name = parsed.data.name;
    if (parsed.data.position !== undefined) user.position = parsed.data.position;
    if (parsed.data.location !== undefined) user.location = parsed.data.location;
    if (parsed.data.about !== undefined) user.about = parsed.data.about;
    if (parsed.data.workExperience !== undefined) user.workExperience = parsed.data.workExperience;
    if (parsed.data.education !== undefined) user.education = parsed.data.education;
    if (parsed.data.skills !== undefined) user.skills = parsed.data.skills;
    if (parsed.data.profilePicture !== undefined) user.profilePicture = parsed.data.profilePicture;

    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      position: user.position,
      location: user.location,
      about: user.about,
      workExperience: user.workExperience,
      education: user.education,
      skills: user.skills,
      profilePicture: user.profilePicture
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:userId/follow', authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;
    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(401).json({ error: 'Authenticated user not found' });
    }

    if (currentUser.following.some(id => id.toString() === targetUserId)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({
      ok: true,
      message: 'Successfully followed user',
      followingCount: currentUser.following.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:userId/follow', authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'Cannot unfollow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(401).json({ error: 'Authenticated user not found' });
    }

    if (!currentUser.following.some(id => id.toString() === targetUserId)) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== currentUserId
    );

    await currentUser.save();
    await targetUser.save();

    res.json({
      ok: true,
      message: 'Successfully unfollowed user',
      followingCount: currentUser.following.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:userId/followers', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'name email');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      followers: user.followers.map(f => ({
        id: f._id,
        name: f.name,
        email: f.email
      })),
      count: user.followers.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:userId/following', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'name email');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      following: user.following.map(f => ({
        id: f._id,
        name: f.name,
        email: f.email
      })),
      count: user.following.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send connection request
router.post('/:userId/connection-request', authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'Cannot send connection request to yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(401).json({ error: 'Authenticated user not found' });
    }

    // Check if already connected
    if (currentUser.connections.some(id => id.toString() === targetUserId)) {
      return res.status(400).json({ error: 'Already connected with this user' });
    }

    // Check if request already sent
    if (targetUser.connectionRequests.some(req => req.from.toString() === currentUserId)) {
      return res.status(400).json({ error: 'Connection request already sent' });
    }

    // Check if there's already a request from the target user
    if (currentUser.connectionRequests.some(req => req.from.toString() === targetUserId)) {
      return res.status(400).json({ error: 'This user has already sent you a connection request' });
    }

    targetUser.connectionRequests.push({ from: currentUserId });
    await targetUser.save();

    res.json({
      ok: true,
      message: 'Connection request sent successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending connection requests
router.get('/me/connection-requests', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('connectionRequests.from', 'name email position profilePicture');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const requests = user.connectionRequests.map(req => ({
      from: {
        id: req.from._id,
        name: req.from.name,
        email: req.from.email,
        position: req.from.position,
        profilePicture: req.from.profilePicture
      },
      createdAt: req.createdAt
    }));

    res.json({ requests, count: requests.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept connection request
router.post('/connection-requests/:fromUserId/accept', authenticate, async (req, res) => {
  try {
    const fromUserId = req.params.fromUserId;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(401).json({ error: 'Authenticated user not found' });
    }

    const fromUser = await User.findById(fromUserId);
    if (!fromUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if request exists
    const requestIndex = currentUser.connectionRequests.findIndex(
      req => req.from.toString() === fromUserId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Remove the request
    currentUser.connectionRequests.splice(requestIndex, 1);

    // Add to connections
    currentUser.connections.push(fromUserId);
    fromUser.connections.push(currentUserId);

    await currentUser.save();
    await fromUser.save();

    res.json({
      ok: true,
      message: 'Connection request accepted',
      connectionsCount: currentUser.connections.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject/cancel connection request
router.delete('/connection-requests/:fromUserId', authenticate, async (req, res) => {
  try {
    const fromUserId = req.params.fromUserId;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(401).json({ error: 'Authenticated user not found' });
    }

    // Check if request exists
    const requestIndex = currentUser.connectionRequests.findIndex(
      req => req.from.toString() === fromUserId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Remove the request
    currentUser.connectionRequests.splice(requestIndex, 1);
    await currentUser.save();

    res.json({
      ok: true,
      message: 'Connection request rejected'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get connections list
router.get('/me/connections', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('connections', 'name email position profilePicture about');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const connections = user.connections.map(conn => ({
      id: conn._id,
      name: conn.name,
      email: conn.email,
      position: conn.position,
      profilePicture: conn.profilePicture,
      about: conn.about
    }));

    res.json({ connections, count: connections.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
