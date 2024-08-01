import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Button, Box } from '@mui/material';
import Layout from '@/components/Layout';
import UserManagement from '@/components/admin-components/UserManagement';
import styled from 'styled-components';

const Sidebar = styled.div`
  width: 250px;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
  position: fixed;
`;

const MainSection = styled.div`
  margin-left: 250px;
  padding: 20px;
`;

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('UserManagement');
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
      <Box display="flex">
        <Sidebar>
          <Typography variant="h6" component="div" gutterBottom>
            Admin Dashboard
          </Typography>
          <Button variant="contained" fullWidth onClick={() => setActiveComponent('UserManagement')}>
            Users
          </Button>
          <Button variant="contained" color="secondary" fullWidth onClick={handleLogout} style={{ marginTop: '20px' }}>
            Logout
          </Button>
        </Sidebar>
        <MainSection>
          {activeComponent === 'UserManagement' && <UserManagement />}
        </MainSection>
      </Box>
    </Layout>
  );
};

export default AdminPage;
