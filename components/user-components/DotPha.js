import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 500px;
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

const Info = styled.p`
  margin: 10px 0;
  span {
    font-weight: bold;
    color: #0070f3;
  }
`;

const MandatoryItems = styled.p`
  margin: 10px 0;
  color: red;
  font-weight: bold;
`;

const DotPhaButton = styled.button`
  background: #f44336;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
`;

const Notice = styled.div`
  margin-top: 20px;
  font-size: 12px;
  color: #555;
`;

const DotPha = () => {
  const [user, setUser] = useState(null);
  const [tuVi, setTuVi] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndLevel = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          const { data: userData } = await axios.get(`/api/user/clan/user-info?userId=${storedUser.id}`);
          setUser(userData);

          // const { data: levelData } = await axios.post(`/api/user/dot-pha/levels`, { level: userData.level });
          // setTuVi(levelData.tu_vi);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndLevel();
  }, []);

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (!user) {
    return <Container>Error loading user data.</Container>;
  }

  const expProgress = (user.exp / 38000) * 100; // Example calculation

  return (
    <Container>
      <Title>ĐỘT PHÁ & ĐỘ KIẾP</Title>
      <Info>
        Cảnh giới hiện tại: <span>{user.level}</span>
      </Info>
      <Info>Tiến độ tu luyện</Info>
      <ProgressBar> 
        <Progress width={expProgress} />
      </ProgressBar>
      <Info>{user.exp}/38000</Info>
      <Info>0%</Info>
      <MandatoryItems>Vật phẩm bắt buộc: Không cần vật phẩm phụ trợ</MandatoryItems>
      <Info>Vật phẩm phụ trợ tăng tỉ lệ thành công:</Info>
      <ul>
        <li>Đề Giai Thuấn (5%)</li>
        <li>Tị Lôi Châu (10%)</li>
      </ul>
      <DotPhaButton onClick={() => alert('Đột phá button clicked!')}>Đột phá</DotPhaButton>
      <Notice>
        - Các vật phẩm dùng để đột phá cảnh giới có thể kiếm tại vòng quay may mắn hoặc mua tại Hắc Thị
        <br />
        - Nếu đẳng cấp vật phẩm phụ trợ đạo hữu sử dụng thấp hơn tu vi hiện tại thì tỉ lệ tăng kinh nghiệm sẽ bị giảm xuống, trừ công pháp Vô Cấp
        <br />
        - Nếu đột phá thất bại, đạo hữu sẽ bị mất 4560% kinh nghiệm
      </Notice>
    </Container>
  );
};

export default DotPha;
