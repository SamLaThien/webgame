import React, { useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';

const Wheel = dynamic(() => import('react-custom-roulette').then(mod => mod.Wheel), { ssr: false });

const prizes = [
  { option: 'LdData', style: { backgroundColor: '#FFC300', textColor: '#000' } },
  { option: 'LkData', style: { backgroundColor: '#FF5733', textColor: '#fff' } },
  { option: 'TbData', style: { backgroundColor: '#C70039', textColor: '#fff' } },
  { option: 'CongBac', style: { backgroundColor: '#900C3F', textColor: '#fff' } },
  { option: 'TruBac', style: { backgroundColor: '#581845', textColor: '#fff' } },
  { option: 'CongExp', style: { backgroundColor: '#DAF7A6', textColor: '#000' } },
  { option: 'TruExp', style: { backgroundColor: '#FFC300', textColor: '#000' } },
  { option: 'Random Item', style: { backgroundColor: '#FF5733', textColor: '#fff' } },
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
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
      case 'LdData':
        prizeData = await getLdData();
        break;
      case 'LkData':
        prizeData = await getLkData();
        break;
      case 'TbData':
        prizeData = await getTbData();
        break;
      case 'CongBac':
        prizeData = await getCongoBacData();
        break;
      case 'TruBac':
        prizeData = await getTruBacData();
        break;
      case 'CongExp':
        prizeData = await getCongExpData();
        break;
      case 'TruExp':
        prizeData = await getTruExpData();
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

// Example parseRateArray function
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

async function getLdData() {
  const rate = {
    "Trích Tinh Thảo": 3,
    "Thiên Nguyên Thảo": 20,
    "Hóa Long Thảo": 20,
    "Ngọc Tủy Chi": 10,
    "Uẩn Kim Thảo": 3,
    "Thiên Linh Quả": 5,
    "Huyết Tinh Thảo": 10,
    "Đại Linh Thảo": 1,
    "Luyện Thần Thảo": 1,
    "Hợp Nguyên Thảo": 1,
    "Hóa Nguyên Thảo": 2,
    "Hư Linh Thảo": 1,
    "Linh Thạch HP": 10,
    "Linh Thạch TP": 5
  };
  return await parseRateArray(rate);
}

async function getLkData() {
  const rate = {
    "Vẫn Thiết CP": 1,
    "Vẫn Thiết THP": 1,
    "Vẫn Thiết TP": 1,
    "Vẫn Thiết HP": 3,
    "Tinh Thiết CP": 2,
    "Tinh Thiết THP": 3,
    "Tinh Thiết TP": 4,
    "Tinh Thiết HP": 5,
    "Khai Thiên Thần Thạch": 5,
    "Vĩnh Hằng Thạch": 5,
    "Hồng Hoang Thạch HP": 5,
    "Hồng Hoang Thạch TP": 5,
    "Hồng Hoang Thạch THP": 5,
    "Hồng Hoang Thạch CP": 5,
    "Cửu Thiên Thạch HP":5,
    "Cửu Thiên Thạch TP":5,
    "Cửu Thiên Thạch THP":5,
    "Cửu Thiên Thạch CP":5,
  };
  return await parseRateArray(rate);
}

async function getTbData() {
  const rate = {
    "Tụ Bảo Bài": 17,
    "Túi Sủng Vật": 2,
    "Túi Thức Ăn":3,
    "Túi Phân Bón": 3,
    "Nội Đan C1": 1,
    "Nội Đan C2": 1,
    "Nội Đan C3": 1,
    "Nội Đan C4": 1,
    "Nội Đan C5": 1,
    "Nội Đan C6": 1,
    "Nội Đan C7": 1,
    "Nội Đan C8": 1,
    "Phụ Ma Thạch C1": 6,
    "Phụ Ma Thạch C2": 6,
    "Phụ Ma Thạch C3": 6,
    "Phụ Ma Thạch C4": 6,
    "Phụ Ma Thạch C5": 6,
    "Phụ Ma Thạch C6": 3,
    "Phụ Ma Thạch C7": 3,
    "Phụ Ma Thạch C8": 3,
    "Thời Gian Chi Thủy": 1,
    "Băng Hỏa Ngọc": 1,
    "Bái Thiếp": 5,
  };
  return await parseRateArray(rate);
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
