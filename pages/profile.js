import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { Container, TextField, Button, Typography, Avatar, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUsername(parsedUser.name);
      setBio(parsedUser.bio || '');
      setDateOfBirth(parsedUser.dateOfBirth || '');
      setGender(parsedUser.gender || '');
      setAvatarPreview(parsedUser.image);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleSave = async () => {
    const updatedUser = { ...user };
    const updates = {};

    if (username !== user.name) {
      updates.username = username;
      updatedUser.name = username;
    }
    if (bio !== user.bio) {
      updates.bio = bio;
      updatedUser.bio = bio;
    }
    if (dateOfBirth !== user.dateOfBirth) {
      updates.dateOfBirth = dateOfBirth;
      updatedUser.dateOfBirth = dateOfBirth;
    }
    if (gender !== user.gender) {
      updates.gender = gender;
      updatedUser.gender = gender;
    }
    if (avatarPreview !== user.image) {
      updates.image = avatarPreview;
      updatedUser.image = avatarPreview;
    }

    console.log('Sending data:', { userId: user.id, ...updates });

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...updates }),
      });

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert('Profile updated successfully');
      } else {
        const result = await response.json();
        alert(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(file);
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Profile
        </Typography>
        <Avatar src={avatarPreview} alt={username} sx={{ width: 100, height: 100, mb: 2 }} />
        <Button variant="contained" component="label">
          Upload Avatar
          <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
        </Button>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Date of Birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Gender</InputLabel>
          <Select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
          Save
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ mt: 2, ml: 2 }}>
          Logout
        </Button>
      </Container>
    </Layout>
  );
};

export default Profile;
