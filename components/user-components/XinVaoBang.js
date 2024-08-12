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

const RequestButton = styled.button`
  background-color: ${({ reject }) => (reject ? '#f44336' : '#93B6C8')};
  padding: 12px 20px;
  background-color: #B3D7E8;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background-color: ${({ reject }) => (reject ? '#d32f2f' : '#45a049')};
  }
`;

const XinVaoBang = () => {
  const [clans, setClans] = useState([]);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [requests, setRequests] = useState([]);
  const [currentClanId, setCurrentClanId] = useState(null);
  const [clanOwners, setClanOwners] = useState({});

  useEffect(() => {
    const fetchClans = async () => {
      try {
        const clanResponse = await fetch('/api/admin/clan');
        const clansData = await clanResponse.json();

        // Fetch clan owners' usernames
        const owners = await Promise.all(
          clansData.map(clan => 
            axios.get(`/api/user/clan/user-info?userId=${clan.owner}`)
              .then(res => ({ [clan.owner]: res.data.username }))
              .catch(() => ({ [clan.owner]: 'Unknown User' }))
          )
        );
        
        const ownerMap = Object.assign({}, ...owners);
        setClanOwners(ownerMap);
        setClans(clansData);
      } catch (error) {
        console.error('Error fetching clans:', error);
      }
    };

    // Get username and role from local storage
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUsername(user.name);

        try {
          const roleResponse = await axios.get(`/api/user/clan/check-role?userId=${user.id}`);
          setRole(roleResponse.data.role_id);

          // Get the clan ID of the current user
          const clanResponse = await axios.get(`/api/user/clan-id?userId=${user.id}`);
          const userClanId = clanResponse.data.clan_id;
          setCurrentClanId(userClanId);

          // Fetch requests if the user is a clan leader or elder
          if (roleResponse.data.role_id === '6' || roleResponse.data.role_id === '7') {
            const requestResponse = await axios.get('/api/admin/clan-requests');
            setRequests(Array.isArray(requestResponse.data) ? requestResponse.data : []);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchClans();
    fetchUserData();
  }, []);

  const handleJoinClan = (clanId) => {
    if (!username) {
      alert('Username not found');
      return;
    }

    fetch('/api/user/clan/clan-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, clan_id: clanId })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Request sent successfully');
      }
    })
    .catch(error => console.error('Error sending clan request:', error));
  };

  const handleRequest = async (requestId, action, userId, clanId) => {
    try {
      await axios.put(`/api/admin/clan-requests/${requestId}`, {
        action,
        user_id: userId,
        clan_id: clanId
      });
      alert(action === 'approved' ? 'Yêu cầu đã được chấp nhận' : 'Yêu cầu đã bị từ chối');
      setRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error handling request:', error);
      alert('Lỗi khi xử lý yêu cầu');
    }
  };

  return (
    <Container>
      {role === '6' || role === '7' ? (
        <>
          <Title>Yêu cầu tham gia bang hội</Title>
          <RequestList>
            {requests.filter(request => request.status === 'pending' && request.clan_id !== currentClanId).length > 0 ? (
              requests.filter(request => request.status === 'pending' && request.clan_id !== currentClanId).map(request => (
                <RequestItem key={request.id}>
                  <span>{request.username} yêu cầu tham gia bang hội {request.clan_name}</span>
                  <div>
                    <RequestButton onClick={() => handleRequest(request.id, 'approved', request.user_id, request.clan_id)}>Chấp nhận</RequestButton>
                    <RequestButton reject onClick={() => handleRequest(request.id, 'rejected', request.user_id, request.clan_id)}>Từ chối</RequestButton>
                  </div>
                </RequestItem>
              ))
            ) : (
              <p>Không có yêu cầu nào</p>
            )}
          </RequestList>
        </>
      ) : (
        <>
          <Banner bgColor="#d4edda" color="#155724">
            - Người chơi có thể tham gia vào các bang hội để cùng nhau chiến đấu và hỗ trợ lẫn nhau. Mỗi người chơi chỉ được phép tham gia vào một bang hội duy nhất cùng một lúc. Tuy nhiên, người chơi có thể nộp đơn xin vào nhiều bang hội khác nhau. Để chính thức gia nhập một bang hội, đơn xin của người chơi cần được phê duyệt bởi bang chủ hoặc đại trưởng lão của bang hội đó. Sau khi được phê duyệt, người chơi mới có thể trở thành thành viên chính thức của bang hội.
          </Banner>
          
          {clans.length > 0 ? (
            clans.map((clan, index) => (
              <ClanCard key={clan.id} bgColor={index % 2 === 0 ? '#f0f0f0' : '#e0e0e0'}>
                <div>
                  <p>Tên bang: {clan.name}</p>
                  <p>Bang chủ: {clanOwners[clan.owner] || 'Loading...'}</p>
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
