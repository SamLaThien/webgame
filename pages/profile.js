import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { Container, TextField, Button, Typography, Avatar } from '@mui/material';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUsername(parsedUser.name);
      setAvatar(parsedUser.image);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleSave = () => {
    const updatedUser = { ...user, name: username, image: avatar };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert('Profile updated successfully');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return null;

  return (
    <Layout>
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Profile
        </Typography>
        <Avatar src={avatar} alt={username} sx={{ width: 100, height: 100, mb: 2 }} />
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Avatar URL"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          fullWidth
          margin="normal"
        />
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
