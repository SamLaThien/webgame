import React, { useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';

const Wheel = dynamic(() => import('react-custom-roulette').then(mod => mod.Wheel), { ssr: false });

const prizes = [
  // { option: 'LdData', style: { backgroundColor: '#FFC300', textColor: '#000' } },
  // { option: 'LkData', style: { backgroundColor: '#FF5733', textColor: '#fff' } },
  // { option: 'TbData', style: { backgroundColor: '#C70039', textColor: '#fff' } },
  { option: 'CongBac', style: { backgroundColor: '#900C3F', textColor: '#fff' } },
  { option: 'TruBac', style: { backgroundColor: '#581845', textColor: '#fff' } },
  { option: 'CongExp', style: { backgroundColor: '#DAF7A6', textColor: '#000' } },
  { option: 'TruExp', style: { backgroundColor: '#FFC300', textColor: '#000' } },
  // { option: 'Random Item', style: { backgroundColor: '#FF5733', textColor: '#fff' } },
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  background-color: #B3D7E8;
  color: white;
  border: none;
  cursor: pointer;
`;

const VongQuayMayManPage = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [result, setResult] = useState(null);

  const handleSpinClick = () => {
    const newPrizeIndex = Math.floor(Math.random() * prizes.length);
    setPrizeIndex(newPrizeIndex);
    setMustSpin(true);
  };

  const handlePrizeResult = async () => {
    const selectedPrize = prizes[prizeIndex].option;

    let prizeData;
    switch (selectedPrize) {
      case 'CongBac':
        prizeData = await getCongoBacData();
        await updateUserGameResult('CongBac', prizeData);
        break;
      case 'TruBac':
        prizeData = await getTruBacData();
        await updateUserGameResult('TruBac', prizeData);
        break;
      case 'CongExp':
        prizeData = await getCongExpData();
        await updateUserGameResult('CongExp', prizeData);
        break;
      case 'TruExp':
        prizeData = await getTruExpData();
        await updateUserGameResult('TruExp', prizeData);
        break;
      default:
        prizeData = 'No prize';
    }

    setResult(prizeData);
    setMustSpin(false);
  };

  return (
    <Layout>
      <Container>
        <h1>Vòng Quay May Mắn</h1>
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeIndex}
          data={prizes}
          onStopSpinning={handlePrizeResult}
        />
        <Button onClick={handleSpinClick}>Quay</Button>
        {result && <p>You won: {result}</p>}
      </Container>
    </Layout>
  );
};

export default VongQuayMayManPage;

async function updateUserGameResult(prize, amount) {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.id) {
      throw new Error("User not found in local storage");
    }
    
    const userId = storedUser.id;

    const response = await fetch('/api/user/game/vong-quay/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, prize, amount }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    console.log('User updated successfully:', data);
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

async function getCongoBacData() {
  const rate = {
    '1000': 10,
    '1589': 5,
    '2550': 1,
    '1700': 5,
    '2000': 1,
    '1389': 5,
    '3000': 3,
    '1800': 2,
  };
  return await parseRateArray(rate);
}

async function getTruBacData() {
  const rate = {
    '788': 1,
    '365': 3,
    '1000': 1
  };
  return await parseRateArray(rate);
}

async function getCongExpData() {
  return random(300, 1000);
}

async function getTruExpData() {
  return random(300, 1000);
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function parseRateArray(rate) {
  let totalWeight = 0;
  for (let item in rate) {
    totalWeight += rate[item];
  }
  let randomNum = Math.random() * totalWeight;
  for (let item in rate) {
    if (randomNum < rate[item]) {
      return item;
    }
    randomNum -= rate[item];
  }
}