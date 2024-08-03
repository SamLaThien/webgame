import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const Progress = styled.div`
  width: ${({ width }) => width}%;
  background: #4caf50;
  height: 20px;
`;

const DotPhaButton = styled.button`
  background: #f44336;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const DotPha = () => {
  const [user, setUser] = useState(null);
  const [level, setLevel] = useState(null);
  const [expProgress, setExpProgress] = useState(0);
  const [nextLevel, setNextLevel] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          const { data } = await axios.get(`/api/user/clan/user-info?userId=${storedUser.id}`);
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchLevels = async () => {
      try {
        const { data } = await axios.get('/api/levels');
        if (user && data.length > 0) {
          const userLevel = data.find(level => level.id === user.level);
          const userNextLevel = data.find(level => level.id === user.level + 1);
          setLevel(userLevel);
          setNextLevel(userNextLevel);
          setExpProgress((user.exp / userLevel.exp) * 100);
        }
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    };

    fetchUser();
    fetchLevels();

    const interval = setInterval(() => {
      if (user) {
        axios.post('/api/user/dot-pha/update', { userId: user.id });
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const handleDotPha = async () => {
    try {
      if (user && nextLevel) {
        await axios.post('/api/user/dot-pha/level-up', { userId: user.id, levelId: nextLevel.id });
        const { data } = await axios.get(`/api/user/clan/user-info?userId=${user.id}`);
        setUser(data);
        setLevel(nextLevel);
        setNextLevel(levels => levels.find(level => level.id === nextLevel.id + 1));
        setExpProgress((data.exp / nextLevel.exp) * 100);
      }
    } catch (error) {
      console.error('Error handling dot pha:', error);
    }
  };

  if (!user || !level) return null;

  return (
    <Container>
      <Title>Đột phá</Title>
      <p>Cảnh giới hiện tại: {level.tu_vi}</p>
      <p>Tiến độ tu luyện</p>
      <ProgressBar>
        <Progress width={expProgress} />
      </ProgressBar>
      <p>Vật phẩm bắt buộc: {level.vatpham_bat_buoc}</p>
      <DotPhaButton onClick={handleDotPha}>Đột phá</DotPhaButton>
    </Container>
  );
};

export default DotPha;
