import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import CboxGeneral from '../components/CboxGeneral';
import { useRouter } from 'next/router';
import Link from 'next/link';

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

const ButtonsContainer = styled.div`
  display: ${props => (props.isOpen ? 'block' : 'none')};
`;

const MainContent = styled.div`
  flex: 1;
  padding: 0;
`;

const Button = styled.a`
  width: 100%;
  padding: 10px;
  background-color: white;
  color: black;
  cursor: pointer;
  font-size: 16px;
  text-align: left;
  border: #B3D7E8 1px solid;
  border-top: none;
  text-decoration: none;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  &:hover {
    background-color: #93B6C8;
  }

  &.active {
    background-color: #B3D7E8;
  }
`;
const StyledLink = styled(Link)`
  text-decoration: none;
`;
const Home = () => {
  const router = useRouter();
  const [openSections, setOpenSections] = useState({
    taikhoan: false,
    taisan: false,
    tulyen: false,
    bangphai: false,
  });
  const [isInClan, setIsInClan] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const clanResponse = await fetch(`/api/user/clan/check-if-clan-member?userId=${user.id}`);
        const clanData = await clanResponse.json();
        setIsInClan(clanData.isInClan);
      }
    };

    if (isMounted) {
      fetchUserData();
    }
  }, [isMounted]);

  const toggleSection = (section) => {
    setOpenSections(prevState => ({
      ...prevState,
      [section]: !prevState[section]
    }));
  };

  return (
    <Layout>
      <Container>
        <Sidebar>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('taikhoan')}>Tài khoản</SectionTitle>
            <ButtonsContainer isOpen={openSections.taikhoan}>
              <StyledLink href="/user?section=hoso" passHref>
                <Button className={router.query.section === 'hoso' ? 'active' : ''}>Hồ sơ</Button>
              </StyledLink>
              <StyledLink href="/user?section=tinnhan" passHref>
                <Button className={router.query.section === 'tinnhan' ? 'active' : ''}>Tin nhắn</Button>
              </StyledLink>
              <StyledLink href="/user?section=doimatkhau" passHref>
                <Button className={router.query.section === 'doimatkhau' ? 'active' : ''}>Đổi mật khẩu</Button>
              </StyledLink>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('taisan')}>Tài sản</SectionTitle>
            <ButtonsContainer isOpen={openSections.taisan}>
              <StyledLink href="/user?section=ruongchuado" passHref>
                <Button className={router.query.section === 'ruongchuado' ? 'active' : ''}>Rương chứa đồ</Button>
              </StyledLink>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('tulyen')}>Tu luyện</SectionTitle>
            <ButtonsContainer isOpen={openSections.tulyen}>
              <StyledLink href="/user?section=dotpha" passHref>
                <Button className={router.query.section === 'dotpha' ? 'active' : ''}>Đột phá</Button>
              </StyledLink>
              <StyledLink href="/user?section=quythi" passHref>
                <Button className={router.query.section === 'quythi' ? 'active' : ''}>Hắc Điếm</Button>
              </StyledLink>
              <StyledLink href="/user?section=luyendanthat" passHref>
                <Button className={router.query.section === 'luyendanthat' ? 'active' : ''}>Luyện đan thất</Button>
              </StyledLink>
              <StyledLink href="/user?section=nhiemvuduong" passHref>
                <Button className={router.query.section === 'nhiemvuduong' ? 'active' : ''}>Nhiệm vụ đường</Button>
              </StyledLink>
              <StyledLink href="/user?section=daokhoang" passHref>
                <Button className={router.query.section === 'daokhoang' ? 'active' : ''}>Đào khoáng</Button>
              </StyledLink>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('bangphai')}>Bang phái</SectionTitle>
            <ButtonsContainer isOpen={openSections.bangphai}>
              <StyledLink href="/user?section=xinvaobang" passHref>
                <Button className={router.query.section === 'xinvaobang' ? 'active' : ''}>Xin vào bang</Button>
              </StyledLink>
              {isInClan && (
                <>
                  <StyledLink href="/user?section=nghisudien" passHref>
                    <Button className={router.query.section === 'nghisudien' ? 'active' : ''}>Nghị sự điện</Button>
                  </StyledLink>
                  <StyledLink href="/user?section=baokhophong" passHref>
                    <Button className={router.query.section === 'baokhophong' ? 'active' : ''}>Bảo khố phòng</Button>
                  </StyledLink>
                  <StyledLink href="/user?section=lanhsuduong" passHref>
                    <Button className={router.query.section === 'lanhsuduong' ? 'active' : ''}>Lãnh Sự Đường</Button>
                  </StyledLink>
                </>
              )}
            </ButtonsContainer>
          </SidebarSection>
        </Sidebar>
        <MainContent>
          <CboxGeneral />
        </MainContent>
      </Container>
    </Layout>
  );
};

export default Home;
