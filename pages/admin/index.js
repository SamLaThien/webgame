import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { Container, Typography, Button } from '@mui/material';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === 1) {
        setUser(parsedUser);
      } else {
        router.push('/');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return null;

  return (
    <Layout>
      <Container>
        <Typography variant="h2" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom>
          Welcome, {user.name}
        </Typography>
        <Button variant="contained" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Container>
    </Layout>
  );
};

export default AdminPage;
