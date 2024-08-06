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
  background-color: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  padding-right: 20px;
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
  border-radius: 0;
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
  background-color: none;
  padding: 0;
  
`;

const MainContent = styled.div`
  flex: 1;
  padding: 0;
  background-color: none;
`;

const Button = styled.a`
  width: 100%;
  padding: 10px;
  margin: 0;
  border: none;
  background-color: white;
  color: black;
  border-radius: 0;
  cursor: pointer;
  font-size: 16px;
  text-align: left;
  border: #B3D7E8 1px solid;
  border-top: none;
  text-decoration: none !important;
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

const ProfilePage = () => {
  const router = useRouter();
  const [openSections, setOpenSections] = useState({
    taikhoan: false,
    taisan: false,
    tulyen: false,
    bangphai: false,
  });
  const [isInClan, setIsInClan] = useState(false);

  useEffect(() => {
    const checkClanStatus = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const response = await fetch(`/api/user/clan/check-if-clan-member?userId=${user.id}`);
        const data = await response.json();
        setIsInClan(data.isInClan);
      }
    };

    checkClanStatus();
  }, []);

  const toggleSection = (section) => {
    setOpenSections(prevState => ({
      ...prevState,
      [section]: !prevState[section]
    }));
  };

  const getCurrentComponent = () => {
    switch (router.query.section) {
      case 'hoso':
        return <HoSo />;
      case 'tinnhan':
        return <TinNhan />;
      case 'doimatkhau':
        return <DoiMatKhau />;
      case 'ruongchuado':
        return <RuongChuaDo />;
      case 'dotpha':
        return <DotPha />;
      case 'quythi':
        return <QuyThi />;
      case 'luyendanthat':
        return <LuyenDanThat />;
      case 'nhiemvuduong':
        return <NhiemVuDuong />;
      case 'daokhoang':
        return <DaoKhoang />;
      case 'xinvaobang':
        return <XinVaoBang />;
      case 'nghisudien':
        return <NghiSuDien />;
      case 'baokhophong':
        return <BaoKhoPhong />;
      case 'lanhsuduong':
        return <LanhSuDuong />;
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
              <Link href="/user?section=hoso" passHref>
                <Button className={router.query.section === 'hoso' ? 'active' : ''}>Hồ sơ</Button>
              </Link>
              <Link href="/user?section=tinnhan" passHref>
                <Button className={router.query.section === 'tinnhan' ? 'active' : ''}>Tin nhắn</Button>
              </Link>
              <Link href="/user?section=doimatkhau" passHref>
                <Button className={router.query.section === 'doimatkhau' ? 'active' : ''}>Đổi mật khẩu</Button>
              </Link>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('taisan')}>Tài sản</SectionTitle>
            <ButtonsContainer isOpen={openSections.taisan}>
              <Link href="/user?section=ruongchuado" passHref>
                <Button className={router.query.section === 'ruongchuado' ? 'active' : ''}>Rương chứa đồ</Button>
              </Link>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('tulyen')}>Tu luyện</SectionTitle>
            <ButtonsContainer isOpen={openSections.tulyen}>
              <Link href="/user?section=dotpha" passHref>
                <Button className={router.query.section === 'dotpha' ? 'active' : ''}>Đột phá</Button>
              </Link>
              <Link href="/user?section=quythi" passHref>
                <Button className={router.query.section === 'quythi' ? 'active' : ''}>Hắc Điếm</Button>
              </Link>
              <Link href="/user?section=luyendanthat" passHref>
                <Button className={router.query.section === 'luyendanthat' ? 'active' : ''}>Luyện đan thất</Button>
              </Link>
              <Link href="/user?section=nhiemvuduong" passHref>
                <Button className={router.query.section === 'nhiemvuduong' ? 'active' : ''}>Nhiệm vụ đường</Button>
              </Link>
              <Link href="/user?section=daokhoang" passHref>
                <Button className={router.query.section === 'daokhoang' ? 'active' : ''}>Đào khoáng</Button>
              </Link>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('bangphai')}>Bang phái</SectionTitle>
            <ButtonsContainer isOpen={openSections.bangphai}>
              <Link href="/user?section=xinvaobang" passHref>
                <Button className={router.query.section === 'xinvaobang' ? 'active' : ''}>Xin vào bang</Button>
              </Link>
              {isInClan && (
                <>
                  <Link href="/user?section=nghisudien" passHref>
                    <Button className={router.query.section === 'nghisudien' ? 'active' : ''}>Nghị sự điện</Button>
                  </Link>
                  <Link href="/user?section=baokhophong" passHref>
                    <Button className={router.query.section === 'baokhophong' ? 'active' : ''}>Bảo khố phòng</Button>
                  </Link>
                  <Link href="/user?section=lanhsuduong" passHref>
                    <Button className={router.query.section === 'lanhsuduong' ? 'active' : ''}>Lãnh Sự Đường</Button>
                  </Link>
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
