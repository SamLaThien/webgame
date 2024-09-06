import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { useRouter } from "next/router";
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';

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
  box-sizing: border-box;
  height: 40px;

`;

const MemberContainer = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const MemberCard = styled.div`
  background: white;
  padding: 14px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: solid 1px #93b6c8;
  box-sizing: border-box;
  @media (min-width: 740px){
    flex-direction: column;
    justify-content: left;
    align-items: flex-start;
    gap: 10px;
    padding: 8px;
  }
`;
const P = styled.p`
  margin: 0;
  font-size: 14px;
`;

const RoleButton = styled.button`
  padding: 10px 20px;
  width: 100px;
  background-color: #93b6c8;
  color: white;
  border: none;
  cursor: pointer;
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
  padding: 10px;
  background-color: #93b6c8;
  color: white;
  border: none;
  cursor: pointer;
  height: 40px;
  width: 150px;
  &:hover {
    background-color: #45a049;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const roles = [
  { label: "Tạp dịch", value: 1 },
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
  const selectRef = useRef(null);
  const selectRefs = useRef([]);

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

        setMembers(membersInfoResponse.data.filter((member) => member.id !== userInfo.id));
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!searchId) {
        const membersInfoResponse = await axios.get("/api/user/clan/members", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(membersInfoResponse.data.filter((member) => member.id !== user.id));
      } else {
        const response = await axios.get(`/api/admin/search-user-id`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { id: searchId },
        });
        const searchedUser = response.data;
        if (searchedUser && searchedUser.length) {
          setMembers(searchedUser.filter((member) => member.id !== user.id));
        } else {
          alert("Không tìm thấy thành viên");
        }
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

      setMembers(membersInfoResponse.data.filter((member) => member.id !== user.id));
    } catch (error) {
      console.error("Error assigning role:", error);
      alert("Phân vai trò thất bại");
    }
  };

  useEffect(() => {
    if (selectedMember) {
      const handleClickOutside = (event) => {
        selectRefs.current.forEach((ref, index) => {
          if (ref && !ref.contains(event.target) && selectedMember === members[index].id) {
            setSelectedMember("");
          }
        });
      };
  
      document.addEventListener("mousedown", handleClickOutside);
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [selectedMember, members]);
  
  if (!user) return null;

  return (
    <>
      <Title> <AccountBalanceOutlinedIcon/>CHẤP SỰ ĐƯỜNG</Title>
      <Container>
        <Wrapper>
        <Input
          type="text"
          placeholder="Nhập ID thành viên"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <Button onClick={handleSearch}>Tìm kiếm</Button>
        </Wrapper>
        
        <MemberContainer>
          {members.map((member, index) => (
            <MemberCard key={member.id} ref={(el) => (selectRefs.current[index] = el)}>
              <div>
                <P>Tên thành viên: {member.username}</P>
                <P>Điểm cống hiến: {member.clan_contribution_points}</P>
              </div>
              <div ref={selectRef}>
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
