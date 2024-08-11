import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { Button, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

const HeaderContainer = styled.header`
  width: calc(100% - 40px);
  height: calc(100px + 1vh);
  background-color: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
`;

const Logo = styled.img`
  height: 50px;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: ${(props) => (props.isLoggedIn ? 'space-between' : 'flex-end')};
`;

const CustomButton = styled(Button)`
  && {
    color: white;
    border: 2px solid white;
    font-size: calc(0.5rem + 1vw);
    text-transform: none;
    margin-left: 20px;
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  
`;

const GameMenuContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 10px;
`;

const GameMenuItem = styled(MenuItem)`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid white;

  &:nth-child(odd) {
    border-right: 1px solid white;
  }

  &:last-child {
    border-right: none;
  }
`;

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [gameAnchor, setGameAnchor] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleGameOpen = (event) => {
    setGameAnchor(event.currentTarget);
  };

  const handleGameClose = () => {
    setGameAnchor(null);
  };

  return (
    <HeaderContainer>
      <Link href='/'>
        <Logo src="/logo2.png" alt="Logo" />
      </Link>
      <NavLinks>
        {user && (
          <>
            <CustomButton
              startIcon={<SportsEsportsIcon fontSize="large" />}
              aria-controls="game-menu"
              aria-haspopup="true"
              onClick={handleGameOpen}
            >
              GAME
            </CustomButton>
            <Menu
              anchorEl={gameAnchor}
              open={Boolean(gameAnchor)}
              onClose={handleGameClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              PaperProps={{
                style: {
                  position: 'fixed',
                  top: 60,
                  left: 20,
                  backgroundColor: '#B3D7E8',
                  color: 'white',
                  padding: 0,
                },
              }}
            >
              <GameMenuContainer>
                <GameMenuItem onClick={() => router.push('/game/oan-tu-ti')}>Oẳn Tù Tì</GameMenuItem>
                <GameMenuItem onClick={() => router.push('/game/vong-quay-may-man')}>Vòng Quay May Mắn</GameMenuItem>
                <GameMenuItem onClick={() => router.push('/game/lo-to')}>Lô Tô</GameMenuItem>
              </GameMenuContainer>
            </Menu>
            <CustomButton
              startIcon={<MenuIcon fontSize="large" />}
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              MENU
            </CustomButton> 
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                style: {
                  position: 'fixed',
                  top: 60,
                  right: 20,
                  backgroundColor: '#B3D7E8',
                  color: 'white',
                  padding: 10,
                },
              }}
            >
              <MenuItem onClick={() => router.push('/user?section=hoso')}>Profile</MenuItem>
              {user.role === 1 && <MenuItem onClick={() => router.push('/admin')}>Admin Page</MenuItem>}
              {user.role === 2 && <MenuItem onClick={() => router.push('/moderator')}>Moderator Panel</MenuItem>}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
        {!user && (
          <>
            <CustomButton onClick={() => router.push('/login')}>Đăng nhập</CustomButton>
            <CustomButton onClick={() => router.push('/register')}>Đăng ký</CustomButton>
          </>
        )}
      </NavLinks>
    </HeaderContainer>
  );
};

export default Header;
