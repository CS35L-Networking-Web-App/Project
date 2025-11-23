import { Router } from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

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

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing: currentUser.following.some(id => id.toString() === req.params.userId)
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

export default router;
