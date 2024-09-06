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
  gap: 5px;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  width: 100%;
  border: 1px solid #ccc;
`;

const MemberContainer = styled.div`
  margin-top: 20px;
`;

const MemberCard = styled.div`
  background: white;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
`;

const RoleButton = styled.button`
  padding: 10px 20px;
  background-color: #93b6c8;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background-color: #45a049;
  }
`;

const RoleSelect = styled.select`
  padding: 10px;
  margin-bottom: 20px;
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
  // { label: "Linh đồng", value: 1 },
  { label: "Ngoại môn đệ tử", value: 2 },
  { label: "Nội môn đệ tử", value: 3 },
  { label: "Hộ pháp", value: 4 },
  { label: "Trưởng lão", value: 5 },
  { label: "Đại trưởng lão", value: 6 },
  { label: "Ngân quỹ", value: 6 },

];

const ChapSuDuong = () => {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [newRole, setNewRole] = useState("");
  const [searchId, setSearchId] = useState("");
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

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/admin/search-user-id`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: searchId },
      });
      const searchedUser = response.data;
      if (searchedUser && searchedUser.length) {
        setMembers(searchedUser);
      } else {
        alert("Không tìm thấy thành viên");
      }
    } catch (error) {
      console.error("Error searching user by ID:", error);
      alert("Lỗi tìm kiếm thành viên.");
    }
  };

  const handleAssignRole = async (targetUserId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authorization token not found");
      }

      await axios.post(
        "/api/user/clan/assign-role",
        {
          userId: user.id,
          targetUserId,
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

  if (!user) return null;

  return (
    <>
      <Title>Chấp Sự Đường</Title>
      <Container>
        <Input
          type="text"
          placeholder="Nhập ID thành viên"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <Button onClick={handleSearch}>Tìm kiếm</Button>
        <MemberContainer>
          {members.map((member) => (
            <MemberCard key={member.id}>
              <div>
                <p>Tên thành viên: {member.username}</p>
                <p>Điểm cống hiến: {member.clan_contribution_points}</p>
              </div>
              <div>
                <RoleButton onClick={() => setSelectedMember(member.id)}>
                  Phân vai
                </RoleButton>
                {selectedMember === member.id && (
                  <>
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
                    <Button onClick={() => handleAssignRole(member.id)}>
                      Xác nhận vai trò
                    </Button>
                  </>
                )}
              </div>
            </MemberCard>
          ))}
        </MemberContainer>
      </Container>
    </>
  );
};

export default ChapSuDuong;
