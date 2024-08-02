import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const ClanCard = styled.div`
  background: ${({ bgColor }) => bgColor || 'white'};
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const XinVaoBang = () => {
  const [clans, setClans] = useState([]);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    console.log('Fetching clans...');
    fetch('/api/admin/clan')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched clans:', data);
        setClans(data);
      })
      .catch(error => console.error('Error fetching clans:', error));

    // Get username from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('Fetched username from local storage:', user.name);
      setUsername(user.name);
    }
  }, []);

  const handleJoinClan = (clanId) => {
    if (!username) {
      alert('Username not found');
      return;
    }

    console.log('Sending clan request with:', { username, clan_id: clanId });
    fetch('/api/user/clan/clan-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, clan_id: clanId })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Clan request response:', data);
        if (data.error) {
          alert(data.error);
        } else {
          alert('Request sent successfully');
        }
      })
      .catch(error => console.error('Error sending clan request:', error));
  };

  return (
    <Container>
      <Title>Xin vào bang</Title>
      {clans.map((clan, index) => (
        <ClanCard key={clan.id} bgColor={index % 2 === 0 ? '#f0f0f0' : '#e0e0e0'}>
          <div>
            <p>Tên bang: {clan.name}</p>
            <p>Bang chủ: {clan.owner}</p>
            <p>Điểm cống hiến: {clan.contributionPoints}</p>
          </div>
          <button onClick={() => handleJoinClan(clan.id)}>Xin vào</button>
        </ClanCard>
      ))}
    </Container>
  );
};

export default XinVaoBang;
