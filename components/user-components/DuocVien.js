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
  margin-top: 20px;
`;

const HerbItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
`;

const HarvestButton = styled.button`
  padding: 5px 10px;
  background-color: ${({ active }) => (active ? "#42a5f5" : "#ddd")};
  color: ${({ active }) => (active ? "white" : "#888")};
  border: none;
  cursor: ${({ active }) => (active ? "pointer" : "not-allowed")};
  font-size: 14px;

  &:hover {
    background-color: ${({ active }) => (active ? "#1e88e5" : "#ddd")};
  }
`;

const DuocVien = () => {
  const [herbs, setHerbs] = useState([]);
  const [userHerbs, setUserHerbs] = useState([]);
  const [selectedHerb, setSelectedHerb] = useState("");

  useEffect(() => {
    fetchHerbs();
    fetchUserHerbs();

    const interval = setInterval(async () => {
      // await updateHerbGrowthStatus();
      fetchUserHerbs();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // const updateHerbGrowthStatus = async () => {
  //   const currentTime = new Date();
  //   const updatedHerbs = await Promise.all(
  //     userHerbs.map(async (herb) => {
  //       if (!herb.isGrown && currentTime >= new Date(herb.endAt)) {
  //         await updateHerbIsGrown(herb.id);
  //         return { ...herb, isGrown: true };
  //       }
  //       return herb;
  //     })
  //   );
  //   setUserHerbs(updatedHerbs);
  // };

  // const updateHerbIsGrown = async (herbId) => {
  //   try {
  //     await axios.post(
  //       "/api/user/duoc-vien/update",
  //       { herbId },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Error updating herb growth status:", error);
  //   }
  // };

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
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Đã xảy ra lỗi khi gieo hạt. Vui lòng thử lại.");
      }
    }
  };

  const handleGieoHatKhongKimThuong = async () => {
    if (!selectedHerb) {
      alert("Vui lòng chọn thảo dược trước khi gieo hạt.");
      return;
    }

    try {
      const response = await axios.post(
        "/api/user/duoc-vien/plant-without",
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
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Đã xảy ra lỗi khi gieo hạt. Vui lòng thử lại.");
      }
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
      console.error("Error harvesting herb:", error);
      alert("Đã xảy ra lỗi khi thu hoạch. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <SectionTitle><SpaIcon/> DƯỢC VIÊN</SectionTitle>

      <Container>
        <InfoContainer>
          <InfoText>
            <strong>Túi hạt giống:</strong> tùy loại hạt giống và số lượng linh
            điền đã trồng loại hạt giống đó mà có giá khác nhau, vui lòng xem
            bên dưới.
          </InfoText>
          <InfoText>
            <strong>Kim thưởng:</strong> để trồng 1 ô linh điền bạn sẽ mất 1 kim
            thưởng, hoặc có thể mua hệ thống với giá 500 bạc.
          </InfoText>
          <InfoText>
            <strong>Dùng Hộ Linh Trận</strong> sẽ chặn đứng các tên trộm thảo
            dược.
          </InfoText>
        </InfoContainer>

        <SelectContainer>
          <Select
            value={selectedHerb}
            onChange={(e) => setSelectedHerb(e.target.value)}
          >
            <Option value="" disabled>
              Chọn thảo dược...
            </Option>
            {herbs.map((herb) => (
              <Option key={herb.id} value={herb.id}>
                {herb.name} ({herb.price} bạc/túi. Trồng {herb.grow_time}h)
              </Option>
            ))}
          </Select>
          <ButtonContainer>
            <Button
              color="#42a5f5"
              hoverColor="#1e88e5"
              onClick={handleGieoHat}
            >
              Gieo hạt
            </Button>
            <Button
              color="#fbc02d"
              hoverColor="#f9a825"
              onClick={handleGieoHatKhongKimThuong}
            >
              Gieo không kim thuổng
            </Button>
          </ButtonContainer>
        </SelectContainer>

        <HerbsList>
          {userHerbs
            .filter((herb) => !herb.isGrown && !herb.isCollected)
            .map((herb) => (
              <HerbItem key={herb.id}>
                {herb.name} - {herb.isGrown ? "Đã lớn" : "Đang phát triển"} -{" "}
                {herb.isCollected ? "Đã thu hoạch" : "Chưa thu hoạch"}
                {/* <HarvestButton
                active={herb.isGrown && !herb.isCollected}
                onClick={() =>
                  herb.isGrown && !herb.isCollected && handleHarvest(herb.id)
                }
              >
                Thu hoạch
              </HarvestButton> */}
              </HerbItem>
            ))}
        </HerbsList>
      </Container>
    </>
  );
};

export default DuocVien;
