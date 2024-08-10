import { useState } from 'react';
import styled from 'styled-components';
import ReCAPTCHA from 'react-google-recaptcha';

const FormContainer = styled.div`
  background-color: white;  
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #93B6C8; 
  max-width: 400px;
  width: 100%;
  text-align: center;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: black; 
  font-size: 20px;
  margin: 0;  
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
  width: calc(100% - 20px);
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #93B6C8; 
  border-radius: 4px;
  background-color: #ffffff;  
  color: #333;  
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #93B6C8;  
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #76A9C2; 
  }
`;

const ErrorMessage = styled.p`
  color: red;
`;

const SignupForm = () => {
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!recaptchaToken) {
      alert('Please complete the CAPTCHA');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, recaptchaToken, role: 2 }), 
      });

      const result = await response.json();
      if (response.ok) {
        alert('Registration successful');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Registration failed');
    }
  };

  return (
    <FormContainer>
      <Title>ĐĂNG KÝ</Title>
      <p>Hãy tham gia vào trò chơi cùng với chúng tôi</p>
      <Form onSubmit={handleSubmit}>
        <Input type="text" name="username" placeholder="Nhập username" onChange={handleChange} />
        <Input type="email" name="email" placeholder="Nhập email" onChange={handleChange} />
        <Input type="password" name="password" placeholder="Nhập mật khẩu" onChange={handleChange} />
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          onChange={handleRecaptchaChange}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">Đăng ký</Button>
      </Form>
    </FormContainer>
  );
};

export default SignupForm;
