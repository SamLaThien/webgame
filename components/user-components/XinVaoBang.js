import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
   background: white;
  padding: 20px;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const Banner = styled.div`
  background: ${({ bgColor }) => bgColor || 'white'};
  color: ${({ color }) => color || 'black'};
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const ClanCard = styled.div`
  background: white;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
`;

const JoinButton = styled.button`
  padding: 12px 20px;
  background-color: #B3D7E8;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background-color: #93B6C8;
  }
`;

const LeaveButton = styled.button`
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #d32f2f;
  }
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
      <Banner bgColor="#d4edda" color="#155724">
      - Người chơi có tham gia vào các bang hội để cùng nhau chiến đấu và hỗ trợ lẫn nhau. Mỗi người chơi chỉ được phép tham gia vào một bang hội duy nhất cùng một lúc. Tuy nhiên, người chơi có thể nộp đơn xin vào nhiều bang hội khác nhau. Để chính thức gia nhập một bang hội, đơn xin của người chơi cần được phê duyệt bởi bang chủ hoặc đại trưởng lão của bang hội đó. Sau khi được phê duyệt, người chơi mới có thể trở thành thành viên chính thức của bang hội      </Banner>
      
      {clans.map((clan, index) => (
        <ClanCard key={clan.id} bgColor={index % 2 === 0 ? '#f0f0f0' : '#e0e0e0'}>
          <div>
            <p>Tên bang: {clan.name}</p>
            <p>Bang chủ: {clan.owner}</p>
            <p>Điểm cống hiến: {clan.contributionPoints}</p>
          </div>
          {clan.isMember ? (
            <LeaveButton onClick={() => handleJoinClan(clan.id)}>Thoát bang</LeaveButton>
          ) : (
            <JoinButton onClick={() => handleJoinClan(clan.id)}>Xin vào</JoinButton>
          )}
        </ClanCard>
      ))}
    </Container>
  );
};

export default XinVaoBang;
