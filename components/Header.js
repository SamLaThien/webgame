import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

const HeaderContainer = styled.header`
  width: calc(100% - 40px);
  height: calc(100px + 1vh);
  background-color: #6B8F71;
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

const NavButton = styled.button`
  margin-left: 20px;
  color: white;
  background: none;
  border: none;
  text-decoration: none;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    text-decoration: underline;
  }
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

const MenuItem = styled.div`
  padding: 10px 20px;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }
`;

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <HeaderContainer>
      <Logo src="/logo.png" alt="Logo" />
      <NavLinks>
        {user ? (
          <>
            <UserImage src={user.image} alt={user.name} onClick={() => setMenuOpen(!menuOpen)} />
            <DropdownMenu open={menuOpen}>
              <MenuItem onClick={() => router.push('/profile')}>Profile</MenuItem>
              {user.role === 1 && <MenuItem onClick={() => router.push('/admin')}>Admin Page</MenuItem>}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </DropdownMenu>
          </>
        ) : (
          <>
            <NavButton onClick={() => router.push('/login')}>Đăng nhập</NavButton>
            <NavButton onClick={() => router.push('/register')}>Đăng ký</NavButton>
          </>
        )}
      </NavLinks>
    </HeaderContainer>
  );
};

export default Header;
