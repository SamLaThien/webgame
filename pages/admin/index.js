import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import UserManagement from '@/components/admin-components/UserManagement';
import ClanManagement from '@/components/admin-components/ClanManagement';
import ClanPermissionManagement from '@/components/admin-components/ClanPremissionManagement';

const Container = styled.div`
  display: flex;
  width: 100%;
  height: calc(100vh - 100px);
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #f5f5f5;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ddd;
`;

const SidebarSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.div`
  cursor: pointer;
  font-weight: bold;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;

  &:hover {
    background-color: #45a049;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  background-color: white;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: none;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  text-align: left;

  &:hover {
    background-color: #45a049;
  }

  &.active {
    background-color: #2e7d32;
  }
`;

const AdminPage = () => {
  const [selectedSection, setSelectedSection] = useState('userManagement');
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
        <Sidebar>
          <SidebarSection>
            <SectionTitle onClick={() => setSelectedSection('userManagement')}>User Management</SectionTitle>
            <SectionTitle onClick={() => setSelectedSection('clanManagement')}>Clan Management</SectionTitle>
            <SectionTitle onClick={() => setSelectedSection('clanPermissionManagement')}>Clan Permission Management</SectionTitle>
          </SidebarSection>
          <Button onClick={handleLogout}>Logout</Button>
        </Sidebar>
        <MainContent>
          {selectedSection === 'userManagement' && <UserManagement />}
          {selectedSection === 'clanManagement' && <ClanManagement />}
          {selectedSection === 'clanPermissionManagement' && <ClanPermissionManagement />}
        </MainContent>
      </Container>
    </Layout>
  );
};

export default AdminPage;
