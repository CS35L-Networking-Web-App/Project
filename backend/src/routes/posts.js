import { Router } from 'express';
import { z } from 'zod';
import Post from '../models/post.js';
import User from '../models/user.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const createPostSchema = z.object({
  text: z.string().min(1, 'Post text is required').max(3000, 'Post text exceeds maximum length of 3000 characters')
});

const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment text is required')
});

// Create a new post
router.post('/', authenticate, async (req, res) => {
  try {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const post = await Post.create({
      author: req.userId,
      text: parsed.data.text
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name position profilePicture')
      .populate('comments.author', 'name profilePicture');

    res.status(201).json({
      id: populatedPost._id,
      author: {
        id: populatedPost.author._id,
        name: populatedPost.author.name,
        position: populatedPost.author.position,
        profilePicture: populatedPost.author.profilePicture
      },
      text: populatedPost.text,
      likes: populatedPost.likes,
      likesCount: populatedPost.likes.length,
      comments: populatedPost.comments.map(c => ({
        id: c._id,
        author: {
          id: c.author._id,
          name: c.author.name,
          profilePicture: c.author.profilePicture
        },
        text: c.text,
        createdAt: c.createdAt
      })),
      createdAt: populatedPost.createdAt,
      updatedAt: populatedPost.updatedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all posts or search posts
router.get('/', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q) {
      query = {
        $or: [
          { text: { $regex: q, $options: 'i' }},
          { 'author.name': { $regex: q, $options: 'i' } }
        ]
      };
    }
    
    const posts = await Post.aggregate([
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      ...(q ? [{ $match: query }] : []),
      { $sort: { createdAt: -1 } },
      { $limit: 100 }
    ]);

    const postsWithDetails = posts.map(post => ({
      id: post._id,
      author: {
        id: post.author._id,
        name: post.author.name,
        position: post.author.position,
        profilePicture: post.author.profilePicture
      },
      text: post.text,
      likes: post.likes,
      likesCount: post.likes.length,
      isLiked: post.likes.some(id => id.toString() === req.userId),
      comments: post.comments.map(c => ({
        id: c._id,
        author: {
          id: c.author._id,
          name: c.author.name,
          profilePicture: c.author.profilePicture
        },
        text: c.text,
        createdAt: c.createdAt
      })),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    res.json({ posts: postsWithDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/Unlike a post
router.post('/:postId/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(id => id.toString() === req.userId);

    if (likeIndex === -1) {
      // Like the post
      post.likes.push(req.userId);
      await post.save();
      res.json({ ok: true, liked: true, likesCount: post.likes.length });
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
      await post.save();
      res.json({ ok: true, liked: false, likesCount: post.likes.length });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a comment to a post
router.post('/:postId/comments', authenticate, async (req, res) => {
  try {
    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({
      author: req.userId,
      text: parsed.data.text
    });

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('comments.author', 'name profilePicture');

    const newComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json({
      id: newComment._id,
      author: {
        id: newComment.author._id,
        name: newComment.author.name,
        profilePicture: newComment.author.profilePicture
      },
      text: newComment.text,
      createdAt: newComment.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a post (only author can delete)
router.delete('/:postId', authenticate, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only the author can delete
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.deleteOne({ _id: post._id, author: req.userId });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
