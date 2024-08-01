import { useState } from 'react';
import styled from 'styled-components';
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
import Layout from '@/components/Layout';

const Container = styled.div`
  display: flex;
  width: 70vw;
  height: calc(100vh - 100px);
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: none;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const SidebarSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.div`
  cursor: pointer;
  font-weight: bold;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;

  &:hover {
    background-color: #45a049;
  }
`;

const ButtonsContainer = styled.div`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  background-color: none;
  border-radius: 4px;
  padding: 0;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  background-color: none;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: none;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  text-align: left;

  &:hover {
    background-color: #45a049;
  }

  &.active {
    background-color: #2e7d32;
  }
`;

const ProfilePage = () => {
  const [selectedSection, setSelectedSection] = useState('hoso');
  const [openSections, setOpenSections] = useState({
    taikhoan: false,
    taisan: false,
    tulyen: false,
    bangphai: false
  });

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
              <Button
                className={selectedSection === 'hoso' ? 'active' : ''}
                onClick={() => setSelectedSection('hoso')}
              >
                Hồ sơ
              </Button>
              <Button
                className={selectedSection === 'tinnhan' ? 'active' : ''}
                onClick={() => setSelectedSection('tinnhan')}
              >
                Tin nhắn
              </Button>
              <Button
                className={selectedSection === 'doimatkhau' ? 'active' : ''}
                onClick={() => setSelectedSection('doimatkhau')}
              >
                Đổi mật khẩu
              </Button>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('taisan')}>Tài sản</SectionTitle>
            <ButtonsContainer isOpen={openSections.taisan}>
              <Button
                className={selectedSection === 'ruongchuado' ? 'active' : ''}
                onClick={() => setSelectedSection('ruongchuado')}
              >
                Rương chứa đồ
              </Button>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('tulyen')}>Tu luyện</SectionTitle>
            <ButtonsContainer isOpen={openSections.tulyen}>
              <Button
                className={selectedSection === 'dotpha' ? 'active' : ''}
                onClick={() => setSelectedSection('dotpha')}
              >
                Đột phá
              </Button>
              <Button
                className={selectedSection === 'quythi' ? 'active' : ''}
                onClick={() => setSelectedSection('quythi')}
              >
                Quỷ thị
              </Button>
              <Button
                className={selectedSection === 'luyendanthat' ? 'active' : ''}
                onClick={() => setSelectedSection('luyendanthat')}
              >
                Luyện đan thất
              </Button>
              <Button
                className={selectedSection === 'nhiemvuduong' ? 'active' : ''}
                onClick={() => setSelectedSection('nhiemvuduong')}
              >
                Nhiệm vụ đường
              </Button>
              <Button
                className={selectedSection === 'daokhoang' ? 'active' : ''}
                onClick={() => setSelectedSection('daokhoang')}
              >
                Đào khoáng
              </Button>
            </ButtonsContainer>
          </SidebarSection>
          <SidebarSection>
            <SectionTitle onClick={() => toggleSection('bangphai')}>Bang phái</SectionTitle>
            <ButtonsContainer isOpen={openSections.bangphai}>
              <Button
                className={selectedSection === 'xinvaobang' ? 'active' : ''}
                onClick={() => setSelectedSection('xinvaobang')}
              >
                Xin vào bang
              </Button>
            </ButtonsContainer>
          </SidebarSection>
        </Sidebar>
        <MainContent>
          {selectedSection === 'hoso' && <HoSo />}
          {selectedSection === 'tinnhan' && <TinNhan />}
          {selectedSection === 'doimatkhau' && <DoiMatKhau />}
          {selectedSection === 'ruongchuado' && <RuongChuaDo />}
          {selectedSection === 'dotpha' && <DotPha />}
          {selectedSection === 'quythi' && <QuyThi />}
          {selectedSection === 'luyendanthat' && <LuyenDanThat />}
          {selectedSection === 'nhiemvuduong' && <NhiemVuDuong />}
          {selectedSection === 'daokhoang' && <DaoKhoang />}
          {selectedSection === 'xinvaobang' && <XinVaoBang />}
        </MainContent>
      </Container>
    </Layout>
  );
};

export default ProfilePage;