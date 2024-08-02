import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const ChatSection = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
`;

const ActivitySection = styled.div`
  width: 300px;
  padding: 20px;
  background-color: #fff;
`;

const SectionTitle = styled.h2`
  margin-bottom: 20px;
`;

const ChannelSelector = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
`;

const ChannelButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: ${({ active }) => (active ? '#4caf50' : '#ddd')};
  color: ${({ active }) => (active ? 'white' : 'black')};
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #45a049;
    color: white;
  }
`;

const ChatBox = styled.iframe`
  width: 100%;
  height: calc(100vh - 160px);
  border: none;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActivityItem = styled.div`
  background-color: ${({ color }) => color || '#eee'};
  color: black;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
`;

const NghiSuDien = () => {
  const [selectedChannel, setSelectedChannel] = useState('kenhMonPhai');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Fetch activities here
    // For now, using hardcoded data
    setActivities([
      { id: 1, text: 'Đạo hữu Tôn Nợ 10k Bái vừa nộp bang 1 Tỉ Lôi Châu (còn 0) vào bảo khố (còn 16) (9 giờ trước)', color: '#a8dadc' },
      { id: 2, text: 'Đạo hữu Tôn Nợ 10k Bái vừa nộp bang 14 Khai Thiên Thần Thạch (còn 0) vào bảo khố (còn 14) (9 giờ trước)', color: '#f4a261' },
      { id: 3, text: 'Đạo hữu Tôn Nợ 10k Bái vừa nộp bang 14 Vạn Thiết CP (còn 0) vào bảo khố (còn 15) (9 giờ trước)', color: '#e9c46a' },
      // Add more activities as needed
    ]);
  }, []);

  const cboxBaseUrl = process.env.NEXT_PUBLIC_CBOX_BASE_URL;
  const cboxBoxId = process.env.NEXT_PUBLIC_CBOX_BOXID;
  const cboxBoxTag = process.env.NEXT_PUBLIC_CBOX_BOXTAG;

  return (
    <Container>
      <ChatSection>
        <SectionTitle>Nghị Sự Điện</SectionTitle>
        <ChannelSelector>
          <ChannelButton
            active={selectedChannel === 'kenhMonPhai'}
            onClick={() => setSelectedChannel('kenhMonPhai')}
          >
            Kênh Môn Phái
          </ChannelButton>
          <ChannelButton
            active={selectedChannel === 'kenhTheGioi'}
            onClick={() => setSelectedChannel('kenhTheGioi')}
          >
            Kênh Thế Giới
          </ChannelButton>
        </ChannelSelector>
        <ChatBox
          src={`${cboxBaseUrl}/box/?boxid=${cboxBoxId}&boxtag=${cboxBoxTag}`}
          title="Chat Box"
        />
      </ChatSection>
      <ActivitySection>
        <SectionTitle>Hoạt Động</SectionTitle>
        <ActivityList>
          {activities.map(activity => (
            <ActivityItem key={activity.id} color={activity.color}>
              {activity.text}
            </ActivityItem>
          ))}
        </ActivityList>
        <SectionTitle>Kho Bạc</SectionTitle>
        <ActivityList>
          {/* Add Kho Bạc activities here */}
          {activities.map(activity => (
            <ActivityItem key={activity.id} color={activity.color}>
              {activity.text}
            </ActivityItem>
          ))}
        </ActivityList>
      </ActivitySection>
    </Container>
  );
};

export default NghiSuDien;
