import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.string().optional(),
  about: z.string().optional(),
  education: z.string().optional(),
  skills: z.string().optional(),
  profilePicture: z.string().optional()
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
      about: user.about,
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

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      position: user.position,
      about: user.about,
      education: user.education,
      skills: user.skills,
      profilePicture: user.profilePicture,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing: currentUser.following.some(id => id.toString() === req.params.userId)
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
    if (parsed.data.about !== undefined) user.about = parsed.data.about;
    if (parsed.data.education !== undefined) user.education = parsed.data.education;
    if (parsed.data.skills !== undefined) user.skills = parsed.data.skills;
    if (parsed.data.profilePicture !== undefined) user.profilePicture = parsed.data.profilePicture;

    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      position: user.position,
      about: user.about,
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

export default router;
