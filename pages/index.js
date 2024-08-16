import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import CboxGeneral from '../components/CboxGeneral'; // Import CboxGeneral
import { useRouter } from 'next/router';

const MainContent = styled.div`
  flex: 1;
  padding: 0;
`;

const Home = () => {
  const router = useRouter();
  const [isInClan, setIsInClan] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setIsLoggedIn(true);
        const clanResponse = await fetch(`/api/user/clan/check-if-clan-member?userId=${user.id}`);
        const clanData = await clanResponse.json();
        setIsInClan(clanData.isInClan);
      }
    };

    if (isMounted) {
      fetchUserData();
    }
  }, [isMounted]);

  return (
    <Layout>
      <MainContent>
        {isLoggedIn ? (
          <>
            <CboxGeneral /> {/* Include CboxGeneral */}
          </>
        ) : (
                  <div></div>        )}
      </MainContent>
    </Layout>
  );
};

export default Home;
