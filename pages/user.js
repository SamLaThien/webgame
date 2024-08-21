import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

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
    const fetchUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setIsLoggedIn(true);
        const userInfoResponse = await fetch(`/api/user/clan/user-info?userId=${storedUser.id}`);
        const userInfo = await userInfoResponse.json();
        setUser(userInfo);
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    fetchUserData();
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
