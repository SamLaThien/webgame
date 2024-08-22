import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  width: 70vw;
  height: calc(100vh - 100px);
  padding-top: 20px;
  flex-direction: row;
  @media(max-width: 749px) {
    flex-direction: column;
    width: 90vw;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 0;
`;

const ProfilePage = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateTokenAndFetchUserData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login'); 
        return;
      }

      try {
        const { data } = await axios.get("/api/user/validate-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!data.isValid) {
          router.push('/login'); 
          return;
        }

        const storedUser = JSON.parse(localStorage.getItem('user'));
        const userInfoResponse = await axios.get(`/api/user/clan/user-info?userId=${storedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(userInfoResponse.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Token validation or user data fetching error:", error);
        router.push('/login'); 
      }

      setLoading(false);
    };

    validateTokenAndFetchUserData();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const getCurrentComponent = () => {
    return <div>Your Profile Content</div>;
  };

  return (
    <Layout isLoggedIn={isLoggedIn} user={user}>
      <Container>
        <MainContent>{getCurrentComponent()}</MainContent>
      </Container>
    </Layout>
  );
};

export default ProfilePage;
