import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { Button, Menu, MenuItem, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

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
`;

const CustomButton = styled(Button)`
  && {
    color: white;
    border: 2px solid white;
    font-size: 1.5rem;
    text-transform: none;
    margin-left: 20px;
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
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

  return (
    <HeaderContainer>
      <Link href='/'>
        <Logo src="/logo (2).png" alt="Logo" />
      </Link>
      <NavLinks>
        <CustomButton
          startIcon={<MenuIcon fontSize="large" />}
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleMenuOpen}
        >
          MENU
        </CustomButton>
        
        {user ? (
          <>
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
                },
              }}
            >
              <MenuItem onClick={() => router.push('/user')}>Profile</MenuItem>
              {user.role === 1 && <MenuItem onClick={() => router.push('/admin')}>Admin Page</MenuItem>}
              {user.role === 2 && <MenuItem onClick={() => router.push('/moderator')}>Moderator Panel</MenuItem>}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
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
