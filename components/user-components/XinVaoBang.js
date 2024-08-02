import { useState, useEffect } from 'react';
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
  background: ${props => props.bgColor || '#f5f5f5'};
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

const XinVaoBang = () => {
  const [clans, setClans] = useState([]);

  useEffect(() => {
    fetch('/api/clans')
      .then(response => response.json())
      .then(data => setClans(data.clans))
      .catch(error => console.error('Error fetching clans:', error));
  }, []);

  const handleJoinClan = (clanId) => {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    fetch('/api/clan_requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId, clan_id: clanId })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error('Error sending clan request:', error));
  };

  return (
    <Container>
      <Title>Xin vào bang</Title>
      {clans.map(clan => (
        <ClanCard key={clan.id} bgColor="#f0f8ff">
          <p><strong>Bang chủ:</strong> {clan.owner}</p>
          <p><strong>Điểm cống hiến:</strong> {clan.contributionPoints}</p>
          <Button onClick={() => handleJoinClan(clan.id)}>Xin vào</Button>
        </ClanCard>
      ))}
    </Container>
  );
};

export default XinVaoBang;
