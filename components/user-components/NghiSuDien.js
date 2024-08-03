import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

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
  const [cboxThreadId, setCboxThreadId] = useState(null);
  const [cboxThreadKey, setCboxThreadKey] = useState(null);

  useEffect(() => {
    setActivities([
      { id: 1, text: 'Đạo hữu Tôn Nợ 10k Bái vừa nộp bang 1 Tỉ Lôi Châu (còn 0) vào bảo khố (còn 16) (9 giờ trước)', color: '#a8dadc' },
      { id: 2, text: 'Đạo hữu Tôn Nợ 10k Bái vừa nộp bang 14 Khai Thiên Thần Thạch (còn 0) vào bảo khố (còn 14) (9 giờ trước)', color: '#f4a261' },
      { id: 3, text: 'Đạo hữu Tôn Nợ 10k Bái vừa nộp bang 14 Vạn Thiết CP (còn 0) vào bảo khố (còn 15) (9 giờ trước)', color: '#e9c46a' },
    ]);

    const fetchClanChatInfo = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          const response = await axios.get(`/api/user/clan/cbox?userId=${storedUser.id}`);
          const { cbox_thread_id, cbox_thread_key } = response.data;
          setCboxThreadId(cbox_thread_id);
          setCboxThreadKey(cbox_thread_key);
        }
      } catch (error) {
        console.error('Error fetching clan chat info:', error);
      }
    };

    fetchClanChatInfo();
  }, []);

  const getChatBoxUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_CBOX_BASE_URL;
    const cboxBoxId = process.env.NEXT_PUBLIC_CBOX_BOXID;
    const cboxBoxTag = process.env.NEXT_PUBLIC_CBOX_BOXTAG;

    if (selectedChannel === 'kenhMonPhai' && cboxThreadId && cboxThreadKey) {
      return `${baseUrl}/box/?boxid=${cboxBoxId}&boxtag=${cboxBoxTag}&tid=${cboxThreadId}&tkey=${cboxThreadKey}`;
    } else {
      return `${baseUrl}/box/?boxid=${cboxBoxId}&boxtag=${cboxBoxTag}`;
    }
  };

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
          src={getChatBoxUrl()}
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
