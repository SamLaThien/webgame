import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useRouter } from "next/router";

const Container = styled.div`
  background: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #93b6c8;
`;

const Title = styled.h2`
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
  gap: 5px;`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: transparent;
  color: ${({ active }) => (active ? "#93B6C8" : "lightgray")};
  font-weight: ${({ active }) => (active ? "700" : "300")};
  border-bottom: ${({ active }) => (active ? "2px solid #93B6C8" : "none")};
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: lightgray;
    color: #93b6c8;
  }
`;

const Content = styled.div`
  background: white;
  padding: 0;
  border-radius: 0 0 8px 8px;
  border-top: 2px solid #93b6c8;
  padding-top: 20px;
`;

const RoleSelect = styled.select`
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  width: 100%;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #93b6c8;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

const roles = [
  { label: "Tạp dịch", value: 1 },
  { label: "Linh đồng", value: 1 },
  { label: "Ngoại môn đệ tử", value: 2 },
  { label: "Nội môn đệ tử", value: 3 },
  { label: "Hộ pháp", value: 4 },
  { label: "Trưởng lão", value: 5 },
  { label: "Đại trưởng lão", value: 6 },
  // { label: "Chưởng môn", value: 7 },
];

const LanhSuDuong = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [newRole, setNewRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authorization token not found");
        }

        const userInfoResponse = await axios.get("/api/user/clan/user-info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userInfo = userInfoResponse.data;
        setUser(userInfo);

        if (![6, 7].includes(parseInt(userInfo.clan_role))) {
          router.push("/ho-so");
        }

        const membersInfoResponse = await axios.get("/api/user/clan/members", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMembers(membersInfoResponse.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleAssignRole = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authorization token not found");
      }

      await axios.post(
        "/api/user/clan/assign-role",
        {
          userId: user.id,
          targetUserId: selectedMember,
          newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Phân vai trò thành công");

      const membersInfoResponse = await axios.get("/api/user/clan/members", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMembers(membersInfoResponse.data);
    } catch (error) {
      console.error("Error assigning role:", error);
      alert("Phân vai trò thất bại");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <div>
            <h3>
              Vai trò:{" "}
              {user?.clan_role
                ? roles.find((role) => role.value === user.clan_role)?.label
                : "Chưa có"}
            </h3>
            <p>Điểm cống hiến nhiệm vụ: {user?.task_contribution_points}</p>
            <p>Điểm cống hiến bang: {user?.clan_contribution_points}</p>
          </div>
        );
      case "assign":
        return (
          <div>
            <RoleSelect
              onChange={(e) => setSelectedMember(e.target.value)}
              value={selectedMember}
            >
              <option value="">Chọn thành viên</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username}
                </option>
              ))}
            </RoleSelect>
            <RoleSelect
              onChange={(e) => setNewRole(e.target.value)}
              value={newRole}
            >
              <option value="">Chọn vai trò</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </RoleSelect>
            <Button onClick={handleAssignRole}>Phân vai trò</Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <>
      <Title>Chấp Sự Đường</Title>
      <Container>
        <Tabs>
          <Tab
            active={activeTab === "info"}
            onClick={() => setActiveTab("info")}
          >
            Thông tin
          </Tab>
          <Tab
            active={activeTab === "assign"}
            onClick={() => setActiveTab("assign")}
          >
            Phân vai trò
          </Tab>
        </Tabs>
        <Content>{renderTabContent()}</Content>
      </Container>
    </>
  );
};

export default LanhSuDuong;
