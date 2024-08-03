import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Modal from 'react-modal';

const Container = styled.div`
  background: rgba(255, 255, 255, 0.5); /* semi-transparent background */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  width: 100%;
`;

const SectionTitle = styled.h2`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  &:before {
    content: '';
    flex-grow: 1;
    border-bottom: 2px solid #ccc;
    margin-right: 10px;
  }
  &:after {
    content: '';
    flex-grow: 1;
    border-bottom: 2px solid #ccc;
    margin-left: 10px;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  border: 2px solid #000;
`;

const ChangeLabel = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #93B6C8;
  color: white;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const UserInfoItem = styled.p`
  margin: 5px 0;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  width: 100%;
`;

const Input = styled.input`
  width: calc(100% - 20px); /* Adjust width to prevent overflow */
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #93B6C8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

const HoSo = () => {
  const [user, setUser] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [changeNgoaiHieu, setChangeNgoaiHieu] = useState('');
  const [changeDanhHao, setChangeDanhHao] = useState('');
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('');

  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarFile(file);
        setAvatarPreview(reader.result);
        setModalIsOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSave = async () => {
    if (user.tai_san < 1000) {
      alert('Bạn không có đủ tiền');
      setModalIsOpen(false);
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          image: avatarPreview,
          tai_san: user.tai_san - 1000,
        }),
      });

      if (response.ok) {
        const updatedUser = { ...user, image: avatarPreview, tai_san: user.tai_san - 1000 };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Avatar updated successfully');
      } else {
        const result = await response.json();
        alert(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update avatar');
    }

    setModalIsOpen(false);
  };

  const handleConfirmSave = async () => {
    if (confirmType === 'ngoai_hieu' && user.tai_san < 25000) {
      alert('Bạn không có đủ tiền');
      setConfirmModalIsOpen(false);
      return;
    }

    let newTaiSan = user.tai_san;
    if (confirmType === 'ngoai_hieu') {
      newTaiSan -= 25000;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          [confirmType]: confirmType === 'ngoai_hieu' ? changeNgoaiHieu : changeDanhHao,
          tai_san: newTaiSan,
        }),
      });

      if (response.ok) {
        const updatedUser = {
          ...user,
          [confirmType]: confirmType === 'ngoai_hieu' ? changeNgoaiHieu : changeDanhHao,
          tai_san: newTaiSan,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Update successful');
      } else {
        const result = await response.json();
        alert(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update');
    }

    setConfirmModalIsOpen(false);
  };

  const handleNgoaiHieuChange = () => {
    setConfirmType('ngoai_hieu');
    setConfirmModalIsOpen(true);
  };

  const handleDanhHaoChange = () => {
    setConfirmType('danh_hao');
    setConfirmModalIsOpen(true);
  };

  if (!user) return null;

  return (
    <>
      <Container>
        <SectionTitle>THÔNG TIN CÁ NHÂN</SectionTitle>
        <AvatarContainer>
          <Avatar src={user.image || '/path/to/default-avatar.jpg'} alt="User Avatar" />
          <ChangeLabel onClick={() => document.getElementById('avatarInput').click()}>Đổi</ChangeLabel>
          <input type="file" id="avatarInput" style={{ display: 'none' }} onChange={handleAvatarChange} />
        </AvatarContainer>
        <UserInfo>
          <UserInfoItem>Ngọa hiệu: {user.ngoai_hieu || 'N/A'}</UserInfoItem>
          <UserInfoItem>ID: {user.id}</UserInfoItem>
          <UserInfoItem>Danh hiệu: {user.danh_hao || 'Chưa có danh hiệu'}</UserInfoItem>
          <UserInfoItem>Bang hội: {user.bang_hoi || 'Chưa có bang hội'}</UserInfoItem>
          <UserInfoItem>Tài sản: {user.tai_san || 0} bạc</UserInfoItem>
          <UserInfoItem>Đổi avatar sẽ tốn 1000 bạc</UserInfoItem>
        </UserInfo>
      </Container>
      <Section>
        <SectionTitle>ĐỔI NGOẠI HIỆU</SectionTitle>
        <p>Ngọa hiệu hiện tại: {user.ngoai_hieu || 'N/A'}</p>
        <Input type="text" placeholder="Nhập ngoại hiệu mà bạn muốn đổi" onChange={(e) => setChangeNgoaiHieu(e.target.value)} />
        <Button onClick={handleNgoaiHieuChange}>Đổi</Button>
      </Section>
      <Section>
        <SectionTitle>ĐỔI DANH HÀO</SectionTitle>
        <p>Danh hiệu hiện tại: {user.danh_hao || 'Chưa có danh hiệu'}</p>
        <Input type="text" placeholder="Nhập danh hiệu mà bạn muốn đổi" onChange={(e) => setChangeDanhHao(e.target.value)} />
        <Button onClick={handleDanhHaoChange}>Đổi</Button>
      </Section>
      <Section>
        <SectionTitle>MUA DANH HÀO</SectionTitle>
        <div>
          <label>
            <input type="radio" name="danhHaoOption" value="Mẫu sẵn" defaultChecked /> Mẫu sẵn
          </label>
          <label>
            <input type="radio" name="danhHaoOption" value="Tự nhập" /> Tự nhập
          </label>
        </div>
        <Input type="text" placeholder="Danh hào" />
        <Button>Mua</Button>
        <Button>Đổi màu danh hào</Button>
      </Section>
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} contentLabel="Change Avatar">
        <h2>Change Avatar</h2>
        <img src={avatarPreview} alt="Avatar Preview" style={{ width: '100px', height: '100px' }} />
        <div>
          <Button onClick={handleAvatarSave}>Đổi</Button>
          <Button onClick={() => setModalIsOpen(false)}>Cancel</Button>
        </div>
      </Modal>
      <Modal isOpen={confirmModalIsOpen} onRequestClose={() => setConfirmModalIsOpen(false)} contentLabel="Confirm Change">
        <h2>Confirm Change</h2>
        {confirmType === 'ngoai_hieu' ? (
          <p>Bạn có chắc chắn muốn đổi ngoại hiệu? Điều này sẽ tốn 25000 bạc.</p>
        ) : (
          <p>Bạn có chắc chắn muốn đổi danh hiệu?</p>
        )}
        <div>
          <Button onClick={handleConfirmSave}>Đổi</Button>
          <Button onClick={() => setConfirmModalIsOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  );
};

export default HoSo;
