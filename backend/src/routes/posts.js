import { Router } from 'express';
import { z } from 'zod';
import Post from '../models/post.js';
import User from '../models/user.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const createPostSchema = z.object({
  text: z.string().min(1, 'Post text is required').max(3000, 'Post text exceeds maximum length of 3000 characters')
});

const updatePostSchema = createPostSchema;

const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment text is required')
});
const createReplySchema = z.object({
  text: z.string().min(1, 'Reply text is required')
});

function normalizeId(val) {
  if (!val) return null;
  if (val._id) return val._id.toString();
  if (val.id) return val.id.toString();
  if (val.$oid) return val.$oid.toString();
  return val.toString();
}

// Map comment/reply tree to API shape
function mapComment(comment, userMap) {
  const authorId = normalizeId(comment.author);
  let authorDoc = null;
  if (authorId && userMap) {
    authorDoc = userMap.get(authorId);
  }
  if (!authorDoc && comment.author && comment.author._id) {
    authorDoc = comment.author;
  }
  return {
    id: comment._id,
    author: authorDoc ? {
      id: authorDoc._id,
      name: authorDoc.name,
      profilePicture: authorDoc.profilePicture
    } : undefined,
    text: comment.text,
    isDeleted: comment.isDeleted,
    replies: (comment.replies || []).map(c => mapComment(c, userMap)),
    createdAt: comment.createdAt
  };
}

// Depth-first finder that returns references to the comment and its parent list
function findComment(comments, targetId, parentList = null) {
  for (let i = 0; i < comments.length; i++) {
    const c = comments[i];
    if (c._id.toString() === targetId) {
      return { comment: c, index: i, parentList: parentList || comments };
    }
    if (c.replies && c.replies.length) {
      const found = findComment(c.replies, targetId, c.replies);
      if (found) return found;
    }
  }
  return null;
}

// Remove deleted comments that no longer have visible replies
function pruneDeleted(comments) {
  for (let i = comments.length - 1; i >= 0; i--) {
    const c = comments[i];
    if (c.replies && c.replies.length) {
      pruneDeleted(c.replies);
    }
    const hasReplies = c.replies && c.replies.length > 0;
    if (c.isDeleted && !hasReplies) {
      comments.splice(i, 1);
    }
  }
}

function collectAuthorIds(comments, set) {
  for (const c of comments || []) {
    const id = normalizeId(c.author);
    if (id) set.add(id);
    if (c.replies && c.replies.length) {
      collectAuthorIds(c.replies, set);
    }
  }
}

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

// Add a reply to a comment
router.post('/:postId/comments/:commentId/replies', authenticate, async (req, res) => {
  try {
    const parsed = createReplySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const post = await Post.findById(req.params.postId)
      .populate('comments.author', 'name profilePicture')
      .populate('comments.replies.author', 'name profilePicture');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const target = findComment(post.comments, req.params.commentId);
    if (!target) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!target.comment.replies) {
      target.comment.replies = [];
    }

    target.comment.replies.push({
      author: req.userId,
      text: parsed.data.text,
      isDeleted: false
    });

    await post.save();

    const refreshed = await Post.findById(req.params.postId);

    const authorIds = new Set();
    collectAuthorIds(refreshed.comments || [], authorIds);
    let userMap = new Map();
    if (authorIds.size > 0) {
      const users = await User.find({ _id: { $in: Array.from(authorIds) } })
        .select('name profilePicture');
      userMap = new Map(users.map(u => [u._id.toString(), u]));
    }

    const updatedTarget = findComment(refreshed.comments, req.params.commentId);
    const newReply = updatedTarget.comment.replies[updatedTarget.comment.replies.length - 1];

    res.status(201).json(mapComment(newReply, userMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a comment (only author). If it has replies, mark as deleted; otherwise remove it.
router.delete('/:postId/comments/:commentId', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('comments.author', 'name profilePicture')
      .populate('comments.replies.author', 'name profilePicture');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const found = findComment(post.comments, req.params.commentId);
    if (!found) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const authorId = found.comment.author?._id
      ? found.comment.author._id.toString()
      : found.comment.author.toString();

    if (authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    if (found.comment.replies && found.comment.replies.length > 0) {
      found.comment.text = 'This comment has been deleted';
      found.comment.isDeleted = true;
    } else {
      found.parentList.splice(found.index, 1);
    }

    pruneDeleted(post.comments);

    await post.save();

    const refreshed = await Post.findById(req.params.postId);

    // rebuild user map for nested authors
    const authorIds = new Set();
    collectAuthorIds(refreshed.comments || [], authorIds);
    let userMap = new Map();
    if (authorIds.size > 0) {
      const users = await User.find({ _id: { $in: Array.from(authorIds) } })
        .select('name profilePicture');
      userMap = new Map(users.map(u => [u._id.toString(), u]));
    }

    res.json({
      ok: true,
      comments: (refreshed.comments || []).map(c => mapComment(c, userMap))
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

    // gather all comment author IDs across posts
    const authorIds = new Set();
    for (const post of posts) {
      collectAuthorIds(post.comments || [], authorIds);
    }

    let userMap = new Map();
    if (authorIds.size > 0) {
      const users = await User.find({ _id: { $in: Array.from(authorIds) } })
        .select('name profilePicture');
      userMap = new Map(users.map(u => [u._id.toString(), u]));
    }

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
      comments: (post.comments || []).map(c => mapComment(c, userMap)),
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
      text: parsed.data.text,
      isDeleted: false,
      replies: []
    });

    await post.save();

    const updatedPost = await Post.findById(post._id);

    const authorIds = new Set();
    collectAuthorIds(updatedPost.comments || [], authorIds);
    let userMap = new Map();
    if (authorIds.size > 0) {
      const users = await User.find({ _id: { $in: Array.from(authorIds) } })
        .select('name profilePicture');
      userMap = new Map(users.map(u => [u._id.toString(), u]));
    }

    const newComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json(mapComment(newComment, userMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a post (only author can edit)
router.put('/:postId', authenticate, async (req, res) => {
  try {
    const parsed = updatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only the author can edit
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    post.text = parsed.data.text;
    await post.save();

    // Rebuild the same shape as in GET /api/posts
    const posts = await Post.aggregate([
      { $match: { _id: post._id } },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      { $limit: 1 }
    ]);

    if (!posts.length) {
      return res.status(500).json({ error: 'Failed to load updated post' });
    }

    const updated = posts[0];

    // gather all comment author IDs for this post
    const authorIds = new Set();
    collectAuthorIds(updated.comments || [], authorIds);

    let userMap = new Map();
    if (authorIds.size > 0) {
      const users = await User.find({ _id: { $in: Array.from(authorIds) } })
        .select('name profilePicture');
      userMap = new Map(users.map(u => [u._id.toString(), u]));
    }

    const result = {
      id: updated._id,
      author: {
        id: updated.author._id,
        name: updated.author.name,
        position: updated.author.position,
        profilePicture: updated.author.profilePicture
      },
      text: updated.text,
      likes: updated.likes,
      likesCount: updated.likes.length,
      isLiked: updated.likes.some(id => id.toString() === req.userId),
      comments: (updated.comments || []).map(c => mapComment(c, userMap)),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };

    return res.json(result);
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
