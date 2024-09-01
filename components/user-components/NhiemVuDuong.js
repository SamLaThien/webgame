import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border: 1px solid #93b6c8;
  background-color: white;
  width: 100%;
  box-sizing: border-box;
`;

const SectionTitle = styled.h3`
  margin-bottom: 20px;
  margin-top: 0;
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  background-color: white;
  width: 100%;
  padding: 11px 20px;
  border: 1px solid #93b6c8;
  box-sizing: border-box;
  flex-direction: row;
  gap: 5px;
`;

const StatusContainer = styled.div`
  background-color: #e0f4e5;
  border: 1px solid #b3d7e8;
  padding: 15px;
  border-radius: 8px;
`;

const Status = styled.p`
  margin: 0;
  color: #333;
  font-size: 16px;
`;

const InstructionContainer = styled.div`
  background-color: #d1e7dd;
  padding: 15px;
`;

const Instruction = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
`;

const Button = styled.button`
  padding: 12px 20px;
  background-color: #ffc107;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  text-align: center;

  &:hover {
    background-color: #e0a800;
  }
`;

const Mission = styled.div`
  font-size: 16px;
  border: 1px solid #b3d7e8;
  padding: 10px;
`;

const MissionDetail = styled.div`
  display: flex;
  flex-direction: row;
`;

const MissionButton = styled.button`
  background-color: ${({ active }) => (active ? "green" : "gray")};
  padding: 12px 20px;
  color: white;
  border: none;
  cursor: ${({ active }) => (active ? "pointer" : "not-allowed")};
  font-size: 16px;
  text-align: center;

  &:hover {
    background-color: ${({ active }) => (active ? "#e0a800" : "gray")};
  }
`;

const Progress = styled.div`
  padding: 10px 0;
`;

const MissionStatus = styled.div`
  color: ${({ status }) => {
    if (status === "on going") return "blue";
    if (status === "failed") return "red";
    if (status === "success") return "green";
    return "black";
  }};
`;

const NhiemVuDuong = () => {
  const [missions, setMissions] = useState([]);
  const [status, setStatus] = useState("");

  const fetchMissions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await axios.get("/api/user/nhiem-vu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.missions && response.data.missions.length > 0) {
        setMissions(response.data.missions);
      } else {
        setMissions([]);
      }
    } catch (error) {
      console.error("Error fetching missions:", error);
      setStatus(error.response?.data?.message || "Error fetching missions");
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMissions();
    }, 4000);
  
    return () => clearInterval(intervalId); 
  }, []);

  const handleNhanNhiemVu = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      await axios.post(
        "/api/user/nhiem-vu/nhan-nhiem-vu",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatus("Mission received successfully");

      fetchMissions();
    } catch (error) {
      console.error("Error receiving mission:", error);
      setStatus(error.response?.data?.message || "Error receiving mission");
    }
  };

  const handleNhanQua = async (missionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      await axios.post(
        `/api/user/nhiem-vu/nhan-qua`,
        { missionId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatus(`Reward claimed for mission ID: ${missionId}`);

      fetchMissions();
    } catch (error) {
      console.error("Error claiming reward:", error);
      setStatus(error.response?.data?.message || "Error claiming reward");
    }
  };

  const renderMissionButton = (mission) => {
    const buttonText = mission.giftReceive ? "Đã nhận quà" : "Nhận quà";
    let isButtonActive = false;

    if (
      mission.isFinish &&
      mission.status === "success" &&
      !mission.giftReceive
    ) {
      isButtonActive = true;
    }

    return (
      <MissionButton
        status={mission.status}
        onClick={() => handleNhanQua(mission.id)}
        active={isButtonActive}
        disabled={!isButtonActive}
      >
        {buttonText}
      </MissionButton>
    );
  };

  const formatTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  return (
    <>
      <SectionTitle>NHIỆM VỤ ĐƯỜNG</SectionTitle>

      <Container>
        <InstructionContainer>
          <Instruction>
            - Tùy vận mà đạo hữu sẽ nhận được nhiệm vụ dễ hay khó.
          </Instruction>
          <Instruction>
            - Tùy mỗi nhiệm vụ mà thời gian trả nhiệm vụ sẽ khác nhau.
          </Instruction>
          <Instruction>
            - Tùy tu vi mà số lần nhận được nhiệm vụ trong ngày sẽ khác nhau.
          </Instruction>
          <Instruction>
            - Với mỗi lần hoàn thành nhiệm vụ, đạo hữu sẽ được 1 vào chuỗi nhiệm
            vụ, khi chuỗi nhiệm vụ đạt tới các mốc 50, 100, 150, ..., đạo hữu sẽ
            nhận thêm bonus 50k bạc từ hệ thống.
          </Instruction>
          <Instruction>
            - Khi hủy hoặc trả nhiệm vụ trễ chuỗi nhiệm vụ đều sẽ bị reset về 0,
            có thể dùng Băng Hóa Ngọc để miễn làm nhiệm vụ khó và không bị reset
            chuỗi nhiệm vụ.
          </Instruction>
        </InstructionContainer>
        <Button onClick={handleNhanNhiemVu}>Nhận nhiệm vụ</Button>
        {status && <p>{status}</p>}
        <div>
          {missions.map((mission) => (
            <Mission key={mission.id}>
              <MissionDetail>
                {mission.detail} ({formatTimeAgo(mission.created_at)}){" "}
                <MissionStatus status={mission.status}>
                  ({mission.status})
                </MissionStatus>
              </MissionDetail>
              <Progress>
                Tiến độ: {mission.count}/{mission.time_repeat}
              </Progress>
              {renderMissionButton(mission)}
            </Mission>
          ))}
        </div>
      </Container>
    </>
  );
};

export default NhiemVuDuong;
