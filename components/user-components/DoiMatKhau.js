import React, { useState } from "react";
import styled from "styled-components";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from "axios";

const Container = styled.div`
  background: white;
  padding: 20px;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  text-align: left;
  background-color: white;
  font-size: 18px;
  padding: 11px;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin-top: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: left;
`;

const Label = styled.label`
  width: 100%;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px;
  border: 1px solid #ddd;
  box-sizing: border-box;
  height: 100%;
  font-size: 16px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 12px 10px;
  background-color: #B3D7E8;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  width: 15%;
  &:hover {
    background-color: #93B6C8;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 10px;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-bottom: 10px;
`;

const DoiMatKhau = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/user/change-password",
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccess("Mật khẩu đã được thay đổi thành công.");
        setError("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError("Đã xảy ra lỗi khi thay đổi mật khẩu.");
      }
    } catch (error) {
      setError("Đã xảy ra lỗi khi thay đổi mật khẩu.");
    }
  };

  return (
    <>
      <Title><LockOutlinedIcon/> THAY ĐỔI MẬT KHẨU</Title>
      <Container>
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <Label htmlFor="newPassword">Nhập mật khẩu mới:</Label>
          <Input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
          />

          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới:</Label>
          <Input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu mới"
          />

          <Button type="submit">Xác nhận</Button>
        </Form>
      </Container>
    </>
  );
};

export default DoiMatKhau;
