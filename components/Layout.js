import styled from 'styled-components';
import Header from './Header';
import Sidebar from './SideBar';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: -1;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start; // Align content to the top
  padding-top: calc(200px + 1vh);
`;

const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start; 
`;

const ContentArea = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
  @media( max-width: 749px){
    flex-direction: column;
    padding: 20px;
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const BackImage = styled.img`
  width: 100vw;
`;

const Layout = ({ children }) => (
  <Container>
    <Header />
    <Background>
      <BackImage src="/home-bg-2.jfif" alt="Background" />
    </Background>
    <Main>
      <ContentWrapper>
        <ContentArea>
          <Sidebar /> {/* Add the Sidebar here */}
          <MainContent>{children}</MainContent> {/* Main content area */}
        </ContentArea>
      </ContentWrapper>
    </Main>
  </Container>
);

export default Layout;
