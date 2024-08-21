import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import CboxGeneral from '../components/CboxGeneral';
import { useRouter } from 'next/router';

const MainContent = styled.div`
  flex: 1;
  padding: 0;
`;

const Home = () => {
  const router = useRouter();
  const [isInClan, setIsInClan] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setIsLoggedIn(true);
        const clanResponse = await fetch(`/api/user/clan/check-if-clan-member?userId=${storedUser.id}`);
        const clanData = await clanResponse.json();
        const userInfoResponse = await fetch(`/api/user/clan/user-info?userId=${storedUser.id}`);
        const userInfo = await userInfoResponse.json();
        setUser(userInfo);
        setIsInClan(clanData.isInClan);
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

  return (
    <Layout isLoggedIn={isLoggedIn} user={user}>
      <MainContent>
        {isLoggedIn ? (
          <CboxGeneral />
        ) : (
          <div></div>
        )}
      </MainContent>
    </Layout>
  );
};

export default Home;
