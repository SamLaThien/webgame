import styled from 'styled-components';
import Header from './Header';

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
  align-items: center;
  padding-top: calc(200px + 1vh);
`;

const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const BackImage = styled.img`
  width: 100vw;
`
const Layout = ({ children }) => (
  <Container>
    <Header />
    <Background><BackImage src="/home-bg-2.jfif"></BackImage></Background>
    <Main>
      <ContentWrapper>{children}</ContentWrapper>
    </Main>
  </Container>
);

export default Layout;
