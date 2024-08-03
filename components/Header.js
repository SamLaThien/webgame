import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { Button, Menu, MenuItem, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const HeaderContainer = styled.header`
  width: calc(100% - 40px);
  height: calc(100px + 1vh);
  background-color: #B3D7E8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.img`
  height: 50px;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
`;

const UserImage = styled.img`
  height: 50px;
  width: 50px;
  border-radius: 50%;
  cursor: pointer;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 60px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: ${({ open }) => (open ? 'block' : 'none')};
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
            {/* <UserImage src={user.image || '/default-user.png'} alt={user.name} onClick={handleMenuOpen} /> */}
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
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
