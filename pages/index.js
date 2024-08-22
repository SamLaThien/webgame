import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import CboxGeneral from '../components/CboxGeneral';
import { useRouter } from 'next/router';
import axios from 'axios';

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

        const clanResponse = await axios.get(`/api/user/clan/check-if-clan-member?userId=${storedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsInClan(clanResponse.data.isInClan);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Token validation or user/clan data fetching error:", error);
        router.push('/login');
      }

      setLoading(false);
    };

    validateTokenAndFetchUserData();
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
