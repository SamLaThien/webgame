import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

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

const MissionButton = styled.button`
  width: 60px;
  padding: 8px 12px;
  color: white;
  background-color: #ffc107;
  border: none;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  margin-right: 5px;
  margin-bottom: 5px;
  &:hover {
    background-color: darkgreen;
  }
`;

const MienButton = styled.button`
  width: 60px;
  padding: 8px 12px;
  color: white;
  background-color: green;
  border: none;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  margin-right: 5px;
  margin-bottom: 5px;
  &:hover {
    background-color: darkgreen;
  }
`;

const HuyButton = styled.button`
  width: 60px;
  padding: 8px 12px;
  color: white;
  background-color: red;
  border: none;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  margin-right: 5px;
  margin-bottom: 5px;
  &:hover {
    background-color: darkred;
  }
`;

const Table = styled.table`
  box-sizing: border-box;
  border-collapse: collapse;
  table-layout: fixed;
  @media (max-width: 749px) {
    font-size: 12px;
  }
`;

const Td = styled.td`
  border-bottom: 1px dashed #93b6c8;
  padding: 6px;
  text-align: center;
`;

const Th = styled.th`
  border-bottom: 2px solid #93b6c8;
  padding: 6px;
  text-align: center;
`;

const Tr = styled.tr`
  border-bottom: 1px dashed #93b6c8;
  &:last-child {
    border-bottom: none;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NhiemVuDuong = () => {
  const [missions, setMissions] = useState([]);
  const [details, setDetails] = useState([]);
  const [status, setStatus] = useState("");

  const fetchMissions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await axios.get("/api/user/nhiem-vu/nhiem-vu", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.missions && response.data.missions.length > 0) {
        setMissions(response.data.missions);
      } else {
        setMissions([]);
      }
      setDetails(response.data.userDetails);
    } catch (error) {
      console.error("Error get mission:", error);
      setStatus(error.response?.data?.message || "Error fetching missions");
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleNhanNhiemVu = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    try {
      const response = await axios.post(
        "/api/user/nhiem-vu/nhan-nhiem-vu",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        alert(response.data.message);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error receiving mission:", error);
      setStatus(error.response?.data?.message || "Error receiving mission");
    } finally {
      window.location.reload();
    }
  };

  const handleNhanQua = async (missionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await axios.post(
        `/api/user/nhiem-vu/tra-nhiem-vu`,
        { missionId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        alert(response.data.message);
        setMissions([]);
      } else {
        alert(response.data.message);
      }

    } catch (error) {
      console.error("Error get gif of mission:", error);
      setStatus(error.response?.data?.message || "Error claiming reward");
    } finally {
      window.location.reload();
    }
  };

  const renderMissionButton = (mission) => {
    const buttonText = mission.giftReceive ? "Đã trả" : "Trả";
    let time_repeat = mission.time_repeat;
    let count = mission.count;

    if (count >= time_repeat) {
      isButtonActive = true;
    }
    const isDisabled = false;

    return (
      <ButtonRow>
        <MissionButton
          color="#ffc107"
          hoverColor="#e0a800"
          onClick={() => handleNhanQua(mission.id)}
          disabled={isDisabled}
        >
          {buttonText}
        </MissionButton>
        <MienButton
          onClick={() => handleMien(mission.id)}
          disabled={isDisabled}
        >
          Miễn
        </MienButton>
        <HuyButton onClick={() => handleHuy(mission.id)} disabled={isDisabled}>
          Hủy
        </HuyButton>
      </ButtonRow>
    );
  };

  const handleMien = async (missionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    try {
      const response = await axios.post(
        `/api/user/nhiem-vu/mien`,
        { missionId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setStatus(response.data.message);
      } else {
        setStatus(
          response.data.message || `Không thể miễn cho nhiệm vụ: ${missionId}`
        );
      }
      setMissions([]);
    } catch (error) {
      console.error("Error updating mission count:", error);
      setStatus(
        error.response?.data?.message || "Error updating mission count"
      );
    } finally {
      window.location.reload();
    }
  };

  const handleHuy = async (missionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    if (confirm("Bạn có muốn huỷ nhiệm vụ này")) {
      try {
        const response = await axios.post(
          `/api/user/nhiem-vu/give-up`,
          { missionId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          setStatus(response.data.message);
          setMissions([]);
        } else {
          setStatus(response.data.message);
        }
      } catch (error) {
        console.error("Error avoid mission count:", error);
        setStatus(error.response?.data?.message || "Error cancelling mission");
      } finally {
        window.location.reload();
      }
    }
  };

  const renderMissionTable = () => {
    return (
      <Table>
        <thead>
          <tr>
            <Th>Nội dung nhiệm vụ</Th>
            <Th>Phần thưởng</Th>
            <Th>Nhận lúc</Th>
            <Th>Phải trả lúc</Th>
            <Th>Trả/Hủy nhiệm vụ</Th>
          </tr>
        </thead>
        <tbody>
          {missions.map((mission) => (
            <tr key={mission.id}>
              <Td>{mission.detail}</Td>
              <Td>{mission.prize} {mission.money > 0 ? `và ${mission.money} bạc` : ''}</Td>
              <Td>
                {moment(mission.created_at).format("MM/DD/YYYY HH:mm:ss")}
              </Td>
              <Td>{moment(mission.endAt).format("MM/DD/YYYY HH:mm:ss")}</Td>
              <Td>{renderMissionButton(mission)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <>
      <SectionTitle>
        <AssignmentOutlinedIcon />
        NHIỆM VỤ ĐƯỜNG
      </SectionTitle>

      <Container>
        <InstructionContainer>
          <Instruction>
            - Chuỗi nhiệm vụ hiện tại của đạo hữu là:  {details[0]?.nvd_count}.
          </Instruction>
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
        {missions.length > 0 ? (
          <>
            {status && <p>{status}</p>}
            <div>{renderMissionTable()}</div>
          </>
        ) : (
          <Button onClick={handleNhanNhiemVu}>Nhận nhiệm vụ</Button>
        )}

      </Container>
    </>
  );
};

export default NhiemVuDuong;
