import styled from 'styled-components';
import Header from './Header';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  background-image: url('/home-bg-2.jfif');
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Layout = ({ children }) => (
  <Container>
    <Header />
    <Main>{children}</Main>
  </Container>
);

export default Layout;
