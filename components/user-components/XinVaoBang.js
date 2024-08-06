import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const RequestList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const RequestItem = styled.li`
  background: #fff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RequestButton = styled.button`
  padding: 5px 10px;
  background-color: ${({ reject }) => (reject ? '#f44336' : '#93B6C8')};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: ${({ reject }) => (reject ? '#d32f2f' : '#45a049')};
  }
`;

const XinVaoBang = () => {
  const [clans, setClans] = useState([]);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    console.log('Fetching clans...');
    fetch('/api/admin/clan')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched clans:', data);
        setClans(data);
      })
      .catch(error => console.error('Error fetching clans:', error));

    // Get username and role from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('Fetched username from local storage:', user.name);
      setUsername(user.name);

      axios.get(`/api/user/clan/check-role?userId=${user.id}`)
        .then(response => {
          console.log('Fetched role:', response.data);
          setRole(response.data.role_id);

          // Fetch requests if the user is a clan leader or elder
          if (response.data.role_id === '6' || response.data.role_id === '7') {
            fetch('/api/user/clan/requests')
              .then(response => response.json())
              .then(data => {
                console.log('Fetched requests:', data);
                setRequests(Array.isArray(data) ? data : []);
              })
              .catch(error => console.error('Error fetching requests:', error));
          }
        })
        .catch(error => console.error('Error fetching role:', error));
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

  const handleRequest = async (requestId, approve) => {
    try {
      await axios.post('/api/user/clan/requests', {
        requestId,
        approve,
      });
      alert(approve ? 'Yêu cầu đã được chấp nhận' : 'Yêu cầu đã bị từ chối');
      const requestsInfo = await axios.get('/api/user/clan/requests');
      setRequests(Array.isArray(requestsInfo.data) ? requestsInfo.data : []);
    } catch (error) {
      console.error('Error handling request:', error);
      alert('Lỗi khi xử lý yêu cầu');
    }
  };

  return (
    <Container>
      <Title>Xin vào bang</Title>
      {role === '6' || role === '7' ? (
        <>
          <Title>Yêu cầu tham gia bang hội</Title>
          <RequestList>
            {requests.map(request => (
              <RequestItem key={request.id}>
                <span>{request.username} yêu cầu tham gia bang hội {request.clan_name}</span>
                <div>
                  <RequestButton onClick={() => handleRequest(request.id, true)}>Chấp nhận</RequestButton>
                  <RequestButton reject onClick={() => handleRequest(request.id, false)}>Từ chối</RequestButton>
                </div>
              </RequestItem>
            ))}
          </RequestList>
        </>
      ) : (
        <>
          <Banner bgColor="#d4edda" color="#155724">
            - Người chơi có tham gia vào các bang hội để cùng nhau chiến đấu và hỗ trợ lẫn nhau. Mỗi người chơi chỉ được phép tham gia vào một bang hội duy nhất cùng một lúc. Tuy nhiên, người chơi có thể nộp đơn xin vào nhiều bang hội khác nhau. Để chính thức gia nhập một bang hội, đơn xin của người chơi cần được phê duyệt bởi bang chủ hoặc đại trưởng lão của bang hội đó. Sau khi được phê duyệt, người chơi mới có thể trở thành thành viên chính thức của bang hội
          </Banner>
          
          {clans.length > 0 ? (
            clans.map((clan, index) => (
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
            ))
          ) : (
            <p>Không có bang hội nào để hiển thị</p>
          )}
        </>
      )}
    </Container>
  );
};

export default XinVaoBang;
