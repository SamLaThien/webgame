import styled from "styled-components";
import DiamondIcon from "@mui/icons-material/Diamond";
import { useEffect, useState } from "react";
import axios from "axios";

const Container = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 0;
  margin-bottom: 20px;
  width: 100%;
  border: 1px solid #93b6c8;
  box-sizing: border-box;
  font-size: 16px;
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

const StatusContainer = styled.div`
  background-color: #e0f4e5;
  border: 1px solid #b3d7e8;
  padding: 15px;
  border-radius: 5px;
`;

const Status = styled.p`
  margin: 0;
  color: #333;
  font-size: 16px;
`;

const InstructionContainer = styled.div`
  background-color: #d1e7dd;
  padding: 15px;
  border-radius: 5px;
  margin-top: 10px;
`;

const Instruction = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 20px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  text-align: center;

  ${({ color }) => `
    background-color: ${color};

    &:hover {
      background-color: ${darkenColor(color)};
    }
  `}
`;

const DaoKhoang = () => {
  const [hours, setHours] = useState(""); 
  const [miningCounts, setMiningCounts] = useState({ mine1: 0, mine2: 0, mine3: 0 }); 
  const [loading, setLoading] = useState(false);

  const handleStartMining = async (mineAt) => {
    if (!hours || isNaN(hours) || hours <= 0) {
      alert("Vui lòng nhập số giờ hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authorization token not found");
      }

      const response = await axios.post(
        "/api/user/dao-khoang/start-mining",
        {
          mineAt: mineAt, 
          hour: parseInt(hours), 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchMiningCounts();

      alert("Bắt đầu đào khoáng thành công!");
    } catch (error) {
      console.error("Error starting mining:", error);
      alert("Lỗi khi bắt đầu đào khoáng.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMiningCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/user/dao-khoang/mining-counts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const miningCountsMap = {
        1: 'mine1',
        2: 'mine2',
        3: 'mine3'
      };
  
      const updatedMiningCounts = data.miningCount.reduce((acc, curr) => {
        const mineKey = miningCountsMap[curr.mineAt];
        if (mineKey) {
          acc[mineKey] = curr.count;
        }
        return acc;
      }, { mine1: 0, mine2: 0, mine3: 0 });
  
      setMiningCounts(updatedMiningCounts);
    } catch (error) {
      console.error("Error fetching mining counts:", error);
    }
  };
  

  useEffect(() => {
    fetchMiningCounts();
  }, []);

  return (
    <>
      <SectionTitle>
        <DiamondIcon /> ĐÀO KHOÁNG
      </SectionTitle>
      <Container>
        <StatusContainer>
          <Status>Phí vào mỏ là 200 bạc/1 giờ.</Status>
          <Status>
            - Để đào khoáng đạo hữu cần có Kim Thương (sẽ mất 1 đồ bên/1h), nếu
            không có thì có thể thuê của hệ thống với giá 50 bạc/giờ.
          </Status>
          <Status>
            - Có nhiều hầm mỏ, hãy chọn cho mình hầm mỏ thích hợp. Tùy vận khí
            của bản thân sẽ đào được nhiều hay ít hoặc không đào được gì.
          </Status>
          <Status>- Càng nhiều người cùng đào, tỉ lệ đào được càng cao.</Status>
        </StatusContainer>

        <Input
          type="text"
          placeholder="Số giờ"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />

        <ButtonContainer>
          <Button
            color="#ff7043"
            onClick={() => handleStartMining(1)} 
            disabled={loading}
          >
            Mỏ Linh Cát (đang có {miningCounts.mine1} người đào)
          </Button>
          <Button
            color="#fbc02d"
            onClick={() => handleStartMining(2)} 
            disabled={loading}
          >
            Mỏ Thiên Tân (đang có {miningCounts.mine2} người đào)
          </Button>
          <Button
            color="#42a5f5"
            onClick={() => handleStartMining(3)} 
            disabled={loading}
          >
            Mỏ Nhất Nhật (đang có {miningCounts.mine3} người đào)
          </Button>
        </ButtonContainer>
      </Container>
    </>
  );
};


const darkenColor = (color) => {
  const darkenAmount = 0.1; 
  let usePound = false;

  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);
  let r = (num >> 16) - darkenAmount * 255;
  let g = ((num >> 8) & 0x00ff) - darkenAmount * 255;
  let b = (num & 0x0000ff) - darkenAmount * 255;

  if (r < 0) r = 0;
  if (g < 0) g = 0;
  if (b < 0) b = 0;

  const darkenedColor = (r << 16) | (g << 8) | b;
  return (usePound ? "#" : "") + darkenedColor.toString(16).padStart(6, "0");
};

export default DaoKhoang;
