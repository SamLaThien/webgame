import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import HoSo from '../components/user-components/HoSo';
import TinNhan from '../components/user-components/TinNhan';
import DoiMatKhau from '../components/user-components/DoiMatKhau';
import RuongChuaDo from '../components/user-components/RuongChuaDo';
import DotPha from '../components/user-components/DotPha';
import QuyThi from '../components/user-components/QuyThi';
import LuyenDanThat from '../components/user-components/LuyenDanThat';
import NhiemVuDuong from '../components/user-components/NhiemVuDuong';
import DaoKhoang from '../components/user-components/DaoKhoang';
import XinVaoBang from '../components/user-components/XinVaoBang';
import NghiSuDien from '../components/user-components/NghiSuDien';
import BaoKhoPhong from '../components/user-components/BaoKhoPhong';
import LanhSuDuong from '../components/user-components/LanhSuDuong';
import Layout from '@/components/Layout';

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

const ProfilePage = () => {
  const router = useRouter();
  const [openSections, setOpenSections] = useState({
    taikhoan: false,
    taisan: false,
    tulyen: false,
    bangphai: false,
  });
  const [isInClan, setIsInClan] = useState(false);
  const [role, setRole] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const roleResponse = await fetch(`/api/user/clan/check-role?userId=${user.id}`);
        const roleData = await roleResponse.json();
        setRole(roleData.role_id);

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

  const getCurrentComponent = () => {
    if (!isMounted) return null;

    switch (router.pathname) {
      case '/ho-so':
        return <HoSo />;
      case '/tin-nhan':
        return <TinNhan />;
      case '/doi-mat-khau':
        return <DoiMatKhau />;
      case '/ruong-chua-do':
        return <RuongChuaDo />;
      case '/dot-pha':
        return <DotPha />;
      case '/quy-thi':
        return <QuyThi />;
      case '/luyen-dan-that':
        return <LuyenDanThat />;
      case '/nhiem-vu-duong':
        return <NhiemVuDuong />;
      case '/dao-khoang':
        return <DaoKhoang />;
      case '/xin-vao-bang':
        return <XinVaoBang />;
      case '/nghi-su-dien':
        return <NghiSuDien />;
      case '/bao-kho-phong':
        return <BaoKhoPhong />;
      case '/lanh-su-duong':
        if (role === '6' || role === '7') {
          return <LanhSuDuong />;
        } else {
          alert('Bạn không có quyền truy cập Lãnh Sự Đường');
          router.push('/ho-so');
          return null;
        }
      default:
        return <HoSo />;
    }
  };

  return (
    <Layout>
      <Container>
        <Sidebar>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('taikhoan')}>Tài khoản</SectionTitle>
            <ButtonsContainer isOpen={openSections.taikhoan}>
              <StyledLink href="/ho-so" passHref>
                <Button className={router.pathname === '/ho-so' ? 'active' : ''}>Hồ sơ</Button>
              </StyledLink>
              <StyledLink href="/tin-nhan" passHref>
                <Button className={router.pathname === '/tin-nhan' ? 'active' : ''}>Tin nhắn</Button>
              </StyledLink>
              <StyledLink href="/doi-mat-khau" passHref>
                <Button className={router.pathname === '/doi-mat-khau' ? 'active' : ''}>Đổi mật khẩu</Button>
              </StyledLink>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('taisan')}>Tài sản</SectionTitle>
            <ButtonsContainer isOpen={openSections.taisan}>
              <StyledLink href="/ruong-chua-do" passHref>
                <Button className={router.pathname === '/ruong-chua-do' ? 'active' : ''}>Rương chứa đồ</Button>
              </StyledLink>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('tulyen')}>Tu luyện</SectionTitle>
            <ButtonsContainer isOpen={openSections.tulyen}>
              <StyledLink href="/dot-pha" passHref>
                <Button className={router.pathname === '/dot-pha' ? 'active' : ''}>Đột phá</Button>
              </StyledLink>
              <StyledLink href="/quy-thi" passHref>
                <Button className={router.pathname === '/quy-thi' ? 'active' : ''}>Hắc Điếm</Button>
              </StyledLink>
              <StyledLink href="/luyen-dan-that" passHref>
                <Button className={router.pathname === '/luyen-dan-that' ? 'active' : ''}>Luyện đan thất</Button>
              </StyledLink>
              <StyledLink href="/nhiem-vu-duong" passHref>
                <Button className={router.pathname === '/nhiem-vu-duong' ? 'active' : ''}>Nhiệm vụ đường</Button>
              </StyledLink>
              <StyledLink href="/dao-khoang" passHref>
                <Button className={router.pathname === '/dao-khoang' ? 'active' : ''}>Đào khoáng</Button>
              </StyledLink>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('bangphai')}>Bang phái</SectionTitle>
            <ButtonsContainer isOpen={openSections.bangphai}>
              <StyledLink href="/xin-vao-bang" passHref>
                <Button className={router.pathname === '/xin-vao-bang' ? 'active' : ''}>Xin vào bang</Button>
              </StyledLink>
              {isInClan && (
                <>
                  <StyledLink href="/nghi-su-dien" passHref>
                    <Button className={router.pathname === '/nghi-su-dien' ? 'active' : ''}>Nghị sự điện</Button>
                  </StyledLink>
                <StyledLink href="/bao-kho-phong" passHref>
                    <Button className={router.pathname === '/bao-kho-phong' ? 'active' : ''}>Bảo khố phòng</Button>
                  </StyledLink>
                  <StyledLink href="/lanh-su-duong" passHref>
                    <Button className={router.pathname === '/lanh-su-duong' ? 'active' : ''}>Lãnh Sự Đường</Button>
                  </StyledLink>
                </>
              )}
            </ButtonsContainer>
          </SidebarSection>
        </Sidebar>
        <MainContent>{getCurrentComponent()}</MainContent>
      </Container>
    </Layout>
  );
};

export default ProfilePage;
