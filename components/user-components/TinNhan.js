import React, { useState } from 'react';
import styled from 'styled-components';
import InsertCommentOutlinedIcon from '@mui/icons-material/InsertCommentOutlined';

const Container = styled.div`
  background: white;
  padding: 20px;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  text-align: left;
  background-color: white;
  font-size: 18px;
  padding: 11px;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin-top: 0;

`;

const Banner = styled.div`
  background-color: ${props => props.bgColor || 'transparent'};
  color: ${props => (props.bgColor === '#f8d7da' ? 'black' : 'black')};
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: left;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: transparent;
  color: ${({ active }) => (active ? '#93B6C8' : 'lightgray')};
  font-weight: ${({ active }) => (active ? '700' : '300')};
  border-bottom: ${({ active }) => (active ? '2px solid #93B6C8' : 'none')};

  font-size: 16px;

  cursor: pointer;

  &:hover {
    background-color: lightgray;
    color: #93b6c8;
  }
`;

const TabContent = styled.div`
  display: ${props => (props.active ? 'block' : 'none')};
  border: 1px solid #93b6c8;
  border-radius: 0 0 8px 8px;
  padding: 20px;
  background-color: #f9f9f9;
`;

const TinNhan = () => {
  const [activeTab, setActiveTab] = useState('friends');

  return (
    <>
    <Title><InsertCommentOutlinedIcon/>TIN NHẮN</Title>
    <Container>
      <Banner bgColor="#d1e7dd">
        - Tin nhắn HỆ THỐNG của tất cả mọi người sẽ luôn hiển thị 300 tin chia làm 10 trang. Trang nào trắng nghĩa là số lượng tin nhắn của bạn chưa đủ 300 tin để được lưu tới trang đó.
        <br />
        - Lưu ý không đưa mật khẩu cho bất cứ ai, kể cả admin hay smod hỏi mật khẩu của bạn. Nếu có người hỏi mật khẩu của bạn hãy liên hệ ngay cho BQT.
        <br />
        - Mật khẩu không nên đặt đơn giản để tránh kẻ gian lợi dụng mở ra.
      </Banner>
      <Banner bgColor="#f8d7da">
        Quy tắc xử lý khi phát sinh tranh chấp trong mua bán Tài khoản - Bạc - Vật phẩm: <a href="https://forum.tutiengame.com" target="_blank" rel="noopener noreferrer">https://forum.tuchangioi.xyz</a>
      </Banner>
      <Tabs>
        <Tab active={activeTab === 'friends'} onClick={() => setActiveTab('friends')}>
          Bạn Bè
        </Tab>
        <Tab active={activeTab === 'system'} onClick={() => setActiveTab('system')}>
          Hệ Thống
        </Tab>
      </Tabs>
      <TabContent active={activeTab === 'friends'}>
        {/* Add your friends tab content here */}
      </TabContent>
      <TabContent active={activeTab === 'system'}>
        {/* Add your system tab content here */}
      </TabContent>
    </Container>
    </>
    
  );
};

export default TinNhan;
