import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import SpaIcon from '@mui/icons-material/Spa';

const Container = styled.div`
  background: white;
  padding: 20px;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 749px) {
    padding: 10px;
  }
`;

const SectionTitle = styled.h3`
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

const InfoContainer = styled.div`
  background-color: #e0f4e5;
  border: 1px solid #b3d7e8;
  padding: 15px;
  margin-bottom: 20px;
`;

const InfoText = styled.p`
  margin: 0;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SelectContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  box-sizing: border-box;
  @media (max-width: 749px) {
    padding: 10px 6px;
    flex-direction: column;
    justify-content: flex-start;
  }
`;

const Select = styled.select`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  font-size: 16px;
  box-sizing: border-box;
  appearance: none;
  background-color: #fff;
  overflow: hidden;
  width: 100%;
`;

const Option = styled.option`
  box-sizing: border-box;
  padding: 10px;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  background-color: ${({ color }) => color};
  &:hover {
    background-color: ${({ hoverColor }) => hoverColor};
  }
  @media (max-width: 749px) {
    padding: 10px 6px;
  }
`;

const HerbsList = styled.div`
  display: flex;  // Thêm thuộc tính flex
  flex-wrap: wrap; // Cho phép các phần tử xuống dòng
  margin-top: 20px;
`;

const HerbItem = styled.div`
  flex: 1 1 calc(33.33% - 10px); // Chiều rộng mỗi ô chiếm 1/3 với khoảng cách giữa các ô
  margin-bottom: 10px; // Khoảng cách giữa các hàng
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 10px;
  box-sizing: border-box; // Đảm bảo padding được tính trong chiều rộng
`;

const TimerContainer = styled.div`
  background: ${({ isHarvesting }) => (isHarvesting ? '#ffcc80' : '#e0f7fa')}; // Màu vàng cam nếu đang chờ thu hoạch
  border: 1px solid #00796b;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
`;


const CountdownTimer = ({ name, duration, user }) => {
  const [timeLeft, setTimeLeft] = useState(Math.floor(duration / 1000));

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? `${hours}h ${minutes}m ${secs}s`
      : minutes > 0 ? `${minutes}m ${secs}s`
        : `${secs}s`;
  };

  return (
    <TimerContainer isHarvesting={timeLeft <= 0}>
      <div>{name}</div>
      <div>{timeLeft > 0 ? `Còn ${formatTime(timeLeft)}` : 'Chờ thu hoạch!'}</div>
      <div>{user}</div>
    </TimerContainer>
  );
};


const DuocVien = () => {
  const [herbs, setHerbs] = useState([]);
  const [userHerbs, setUserHerbs] = useState([]);
  const [selectedHerb, setSelectedHerb] = useState("");

  useEffect(() => {
    fetchHerbs();
    fetchUserHerbs();

    const interval = setInterval(fetchUserHerbs, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchHerbs = async () => {
    try {
      const { data } = await axios.get("/api/user/duoc-vien", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setHerbs(data);
    } catch (error) {
      console.error("Error fetching herbs:", error);
    }
  };

  const fetchUserHerbs = async () => {
    try {
      const { data } = await axios.get("/api/user/duoc-vien/user-herbs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const sortedHerbs = data.sort((a, b) => {
        if (a.isGrown && !a.isCollected) return -1;
        if (b.isGrown && !b.isCollected) return 1;
        if (!a.isGrown && !a.isCollected) return -1;
        if (!b.isGrown && !b.isCollected) return 1;
        return 0;
      });

      setUserHerbs(sortedHerbs);
    } catch (error) {
      console.error("Error fetching user herbs:", error);
    }
  };

  const handleGieoHat = async () => {
    if (!selectedHerb) {
      alert("Vui lòng chọn thảo dược trước khi gieo hạt.");
      return;
    }

    try {
      const response = await axios.post(
        "/api/user/duoc-vien/plant",
        { herbId: selectedHerb },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert(response.data.message);
      fetchUserHerbs();
      fetchHerbs();
    } catch (error) {
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi gieo hạt. Vui lòng thử lại.");
    }
  };

  const handleHarvest = async (herbId) => {
    try {
      const response = await axios.post(
        "/api/user/duoc-vien/harvest",
        { herbId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert(response.data.message);
      fetchUserHerbs();
    } catch (error) {
      alert("Đã xảy ra lỗi khi thu hoạch. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <SectionTitle><SpaIcon /> DƯỢC VIÊN</SectionTitle>

      <Container>
        <InfoContainer>
          <InfoText>
            <strong>Túi hạt giống:</strong> tùy loại hạt giống và số lượng linh điền đã trồng loại hạt giống đó mà có giá khác nhau, vui lòng xem bên dưới.
          </InfoText>
          <InfoText>
            <strong>Kim thưởng:</strong> để trồng 1 ô linh điền bạn sẽ mất 1 kim thưởng, hoặc có thể mua hệ thống với giá 500 bạc.
          </InfoText>
          <InfoText>
            <strong>Dùng Hộ Linh Trận</strong> sẽ chặn đứng các tên trộm thảo dược.
          </InfoText>
        </InfoContainer>

        <SelectContainer>
          <Select value={selectedHerb} onChange={(e) => setSelectedHerb(e.target.value)}>
            <Option value="" disabled>Chọn thảo dược...</Option>
            {herbs.map((herb) => (
              <Option key={herb.id} value={herb.id}>
                {herb.name} ({herb.price} bạc/túi. Trồng {herb.grow_time}h)
              </Option>
            ))}
          </Select>
          <ButtonContainer>
            <Button color="#42a5f5" hoverColor="#1e88e5" onClick={handleGieoHat}>
              Gieo hạt
            </Button>
          </ButtonContainer>
        </SelectContainer>

        <HerbsList>
          {userHerbs
            .filter((herb) => !herb.isGrown && !herb.isCollected)
            .map((herb) => (
              <HerbItem key={herb.id}>
                <CountdownTimer name={herb.name} duration={new Date(herb.endAt) - Date.now()} user={herb.ngoai_hieu || herb.username} />
              </HerbItem>
            ))}
        </HerbsList>
      </Container>
    </>
  );
};

export default DuocVien;
