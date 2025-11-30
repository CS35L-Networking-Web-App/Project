import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { updateProfile } from './api.js';

export default function EditProfileModal({ open, onClose, currentProfile, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: currentProfile?.name ?? '',
    position: currentProfile?.position ?? '',
    location: currentProfile?.location ?? '',
    about: currentProfile?.about ?? '',
    workExperience: currentProfile?.workExperience ?? '',
    education: currentProfile?.education ?? '',
    skills: currentProfile?.skills ?? '',
    profilePicture: currentProfile?.profilePicture ?? ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      setError('Name is required');
      setLoading(false);
      return;
    }

    try {
      const updatedProfile = await updateProfile(formData);
      onProfileUpdated(updatedProfile);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              error={formData.name.trim() === ''}
              helperText={formData.name.trim() === '' ? 'Name is required' : ''}
            />
            <TextField
              label="Position (optional)"
              name="position"
              value={formData.position}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., Software Engineer"
            />
            <TextField
              label="Location (optional)"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., San Francisco, CA"
            />
            <TextField
              label="About (optional)"
              name="about"
              value={formData.about}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Tell us about yourself..."
            />
            <TextField
              label="Work Experience (optional)"
              name="workExperience"
              value={formData.workExperience}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., Senior Software Engineer at Google (2020-2023)"
            />
            <TextField
              label="Education (optional)"
              name="education"
              value={formData.education}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g., BS in Computer Science, Stanford University"
            />
            <TextField
              label="Skills (optional)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g., JavaScript, React, Node.js"
            />
            <TextField
              label="Profile Picture URL (optional)"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              fullWidth
              placeholder="Leave empty to use default picture"
              helperText="Enter a valid URL or leave empty for default"
            />
            {error && (
              <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>
                {error}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
