import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Layout from '../../components/Layout';

const Container = styled.div`
  display: flex;
  width: 70vw;
  height: calc(100vh - 100px);
  padding-top: 20px;
  flex-direction: row;
  @media(max-width: 749px) {
    flex-direction: column;
    width: 90vw;
  }
`;

const Sidebar = styled.div`
  width: 250px;
  padding-right: 20px;
  display: flex;
  flex-direction: column;
  @media(max-width: 749px) {  
    width: 100%;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 0;
`;

const SectionTitle = styled.div`
  cursor: pointer;
  font-weight: bold;
  padding: 12px;
  background-color: #B3D7E8;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  border: 1px solid #93B6C8;

  &:hover {
    background-color: #93B6C8;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding-top: 100px;
  border: 1px solid #93B6C8;
`;

const CharacterContainer = styled.div`
  position: relative;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const CharacterImage = styled.img`
  max-width: 300px;
  height: auto;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #ddd;
  background-color: #f4f4f4;

`;

const InfoBox = styled.div`
  background-color: #B3D7E8;
  color: white;
  padding: 10px;
  margin: 10px 0;
  text-align: center;
  width: 300px;
  border-radius: 5px;
  font-weight: bold;
  /* font-family: 'Courier New', Courier, monospace; */
  font-size: 16px;
  border: 1px solid #93B6C8;
`;

const MemberPage = ({ id }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/user/member/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [id]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <Layout>
      <Container>
        {/* <Sidebar>
          <SidebarSection>
            <SectionTitle>Tài khoản</SectionTitle>
          </SidebarSection>
        </Sidebar> */}

        <MainContent>
          <CharacterContainer>
            <CharacterImage src="/nv1.png" alt="Character" /> {/* Replace with your character image */}
            <Avatar 
              src={user.image ? `data:image/png;base64,${user.image}` : '/logo2.png'} 
              alt={user.username || 'Default Avatar'} 
            />
          </CharacterContainer>
          <InfoBox>Tên Ngoại Hiệu: {user.ngoai_hieu}</InfoBox>
          <InfoBox>Số Lượng Bạc: {user.tai_san}</InfoBox>
          <InfoBox>Tên Bang Phái: {user.bang_hoi}</InfoBox>
          <InfoBox>Chức Vụ: {user.clan_role}</InfoBox>
        </MainContent>
      </Container>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
}

export default MemberPage;
