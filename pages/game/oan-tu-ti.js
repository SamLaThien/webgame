// pages/game/oantuti.js
import React from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 36px;
  color: #333;
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
  max-width: 600px;
`;

const PlayButton = styled.button`
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;

  &:hover {
    background-color: #45a049;
  }
`;

const OanTuTiPage = () => {
  return (
    <Layout>
      <Container>
        <Title>Oẳn Tù Tì</Title>
        <Description>
          Welcome to the classic game of Oẳn Tù Tì! Choose your move and play against the computer.
        </Description>
        <PlayButton onClick={() => alert('Let the game begin!')}>
          Play Now
        </PlayButton>
      </Container>
    </Layout>
  );
};

export default OanTuTiPage;
