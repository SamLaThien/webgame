import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/Layout';
import UserManagement from '@/components/admin-components/UserManagement';
import ClanManagement from '@/components/admin-components/ClanManagement';
import LevelManagement from '@/components/admin-components/LevelManagement';
import ClanPremissionManagement from '@/components/admin-components/ClanPremissionManagement';
import VatPhamManagement from '@/components/admin-components/VatPhamManagement';
import WheelManagement from '@/components/admin-components/WheelManagement';
import GiftCodeManagement from '@/components/admin-components/GiftCodeManagement';
import jwt from 'jsonwebtoken';

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #B3D7E8;
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
  padding: 10px;
  color: black;
  border-radius: 4px;
  margin-bottom: 5px;

  &:hover {
    background-color: #93B6C8;
  }

  &.active {
    background-color: #93B6C8;
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
  background-color: transparent;
  color: black !important;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  text-align: left;

  &:hover {
    background-color: #e57373;
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
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decodedToken = jwt.decode(token);
          console.log("Decoded Token:", decodedToken);

          if (decodedToken && decodedToken.userId) {
            const { data: userData } = await axios.get(`/api/user/clan/user-info?userId=${decodedToken.userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            console.log("User data fetched successfully:", userData); 
            setUser(userData);

          
            if (userData.role !== 1) {
              console.error("User is not an admin, redirecting to login");
              router.push('/login');
            }
          } else {
            console.error("Invalid token, redirecting to login");
            router.push('/login');
          }
        } else {
          console.error('No token found in localStorage, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push('/login');
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return <p>Loading...</p>; 


  return (
    <Container>
      <Sidebar>
        <SidebarSection>
          <SectionTitle className={selectedSection === 'userManagement' ? 'active' : ''} onClick={() => setSelectedSection('userManagement')}>Quản lý người dùng</SectionTitle>
          <SectionTitle className={selectedSection === 'clanManagement' ? 'active' : ''} onClick={() => setSelectedSection('clanManagement')}>Quản lý bang hội</SectionTitle>
          <SectionTitle className={selectedSection === 'clanPermissionManagement' ? 'active' : ''} onClick={() => setSelectedSection('clanPermissionManagement')}>Quản lý quyền hạn bang</SectionTitle>
          <SectionTitle className={selectedSection === 'levelManagement' ? 'active' : ''} onClick={() => setSelectedSection('levelManagement')}>Quản lý cấp độ</SectionTitle>
          <SectionTitle className={selectedSection === 'vatPhamManagement' ? 'active' : ''} onClick={() => setSelectedSection('vatPhamManagement')}>Quản lý vật phẩm</SectionTitle>
          <SectionTitle className={selectedSection === 'wheelManagement' ? 'active' : ''} onClick={() => setSelectedSection('wheelManagement')}>Quản lý vòng quay</SectionTitle>
          <SectionTitle className={selectedSection === 'giftCodeManagement' ? 'active' : ''} onClick={() => setSelectedSection('giftCodeManagement')}>Quản lý Gift Code</SectionTitle>
        </SidebarSection>
        <Button onClick={handleLogout}>Đăng xuất</Button>
      </Sidebar>
      <MainContent>
        {selectedSection === 'userManagement' && <UserManagement />}
        {selectedSection === 'clanManagement' && <ClanManagement />}
        {selectedSection === 'clanPermissionManagement' && <ClanPremissionManagement />}
        {selectedSection === 'levelManagement' && <LevelManagement />}
        {selectedSection === 'vatPhamManagement' && <VatPhamManagement />}
        {selectedSection === 'wheelManagement' && <WheelManagement />}
        {selectedSection === 'giftCodeManagement' && <GiftCodeManagement />}
      </MainContent>
    </Container>
  );
};

export default AdminPage;