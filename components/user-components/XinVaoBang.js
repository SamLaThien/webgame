import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

const Container = styled.div`
  background: white;
  padding: 20px;
  border-radius: 0;
  border: solid 1px #93b6c8;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const Banner = styled.div`
  background-color: #b3d7e8;
  color: ${({ color }) => color || "black"};
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const ClanCard = styled.div`
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

const JoinButton = styled.button`
  padding: 12px 20px;
  background-color: #b3d7e8;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background-color: #93b6c8;
  }
`;

const LeaveButton = styled.button`
  padding: 12px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #d32f2f;
  }
`;

const RequestList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const RequestItem = styled.li`
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

const RequestButton = styled.button`
  background-color: ${({ reject }) => (reject ? "#f44336" : "#93B6C8")};
  padding: 12px 20px;
  background-color: #b3d7e8;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background-color: ${({ reject }) => (reject ? "#d32f2f" : "#45a049")};
  }
`;

const XinVaoBang = () => {
  const [clans, setClans] = useState([]);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [requests, setRequests] = useState([]);
  const [currentClanId, setCurrentClanId] = useState(null);
  const [clanOwners, setClanOwners] = useState({});

  useEffect(() => {
    const fetchClans = async () => {
      try {
        const token = localStorage.getItem("token");
        const clanResponse = await axios.get("/api/user/clan", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const clansData = clanResponse.data;

        const owners = await Promise.all(
          clansData.map((clan) =>
            axios
              .get(`/api/user/clan/get-owner-name?userId=${clan.owner}`)
              .then((res) => {
                const { username, ngoai_hieu } = res.data;
                return { [clan.owner]: ngoai_hieu || username };
              })
              .catch(() => ({ [clan.owner]: "Unknown User" }))
          )
        );

        const ownerMap = Object.assign({}, ...owners);
        setClanOwners(ownerMap);
        setClans(clansData);
      } catch (error) {
        console.error("Error fetching clans:", error);
      }
    };

    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const roleResponse = await axios.get(`/api/user/clan/check-role`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRole(roleResponse.data.role_id);

          const clanResponse = await axios.get(`/api/user/clan/clan-id`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const userClanId = clanResponse.data.clan_id;
          console.log("User is in clan with ID: ", userClanId)
          setCurrentClanId(userClanId);

          if (
            roleResponse.data.role_id === "6" ||
            roleResponse.data.role_id === "7"
          ) {
            const requestResponse = await axios.get(
              `/api/user/clan/get-clan-requests`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setRequests(
              Array.isArray(requestResponse.data) ? requestResponse.data : []
            );
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchClans();
    fetchUserData();
  }, []);

  const handleJoinClan = (clanId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("User is not logged in");
      return;
    }

    if (currentClanId) {
      alert("Bạn phải thoát bang trước khi xin vào bang mới");
      return;
    }

    fetch("/api/user/clan/clan-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ clan_id: clanId }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
      })
      .catch((error) => console.error("Error sending clan request:", error));
  };

  const handleRequest = async (requestId, action, userId, clanId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/admin/clan-requests/${requestId}`,
        {
          action,
          user_id: userId,
          clan_id: clanId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(
        action === "approved"
          ? "Yêu cầu đã được chấp nhận"
          : "Yêu cầu đã bị từ chối"
      );
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
    } catch (error) {
      console.error("Error handling request:", error);
      alert("Lỗi khi xử lý yêu cầu");
    }
  };

  const handleLeaveClan = async (clanId) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("User is not logged in");
      return;
    }
  
    try {
      const response = await fetch(`/api/user/clan/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clan_id: clanId }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        setCurrentClanId(null);  
        alert(data.message || "Bạn đã rời bang thành công.");
      } else {
        alert(data.message || "Lỗi khi rời bang.");
      }
    } catch (error) {
      console.error("Error leaving clan:", error);
      alert("Có lỗi xảy ra khi rời bang.");
    }
  };
  
  return (
    <Container>
      {role === "6" || role === "7" ? (
        <>
          <RequestList>
            {requests.filter(
              (request) =>
                request.status === "pending" &&
                request.clan_id === currentClanId
            ).length > 0 ? (
              requests
                .filter(
                  (request) =>
                    request.status === "pending" &&
                    request.clan_id === currentClanId
                )
                .map((request) => (
                  <RequestItem key={request.id}>
                    <span>
                      {request.username} yêu cầu tham gia bang hội{" "}
                      {request.clan_name}
                    </span>
                    <div>
                      <RequestButton
                        onClick={() =>
                          handleRequest(
                            request.id,
                            "approved",
                            request.user_id,
                            request.clan_id
                          )
                        }
                      >
                        Chấp nhận
                      </RequestButton>
                      <RequestButton
                        reject
                        onClick={() =>
                          handleRequest(
                            request.id,
                            "rejected",
                            request.user_id,
                            request.clan_id
                          )
                        }
                      >
                        Từ chối
                      </RequestButton>
                    </div>
                  </RequestItem>
                ))
            ) : (
              <p>Không có yêu cầu nào</p>
            )}
          </RequestList>
        </>
      ) : (
        <>
          <Banner bgColor="#d4edda" color="black">
            - Người chơi có thể tham gia vào các bang hội để cùng nhau chiến đấu
            và hỗ trợ lẫn nhau. Mỗi người chơi chỉ được phép tham gia vào một
            bang hội duy nhất cùng một lúc. Tuy nhiên, người chơi có thể nộp đơn
            xin vào nhiều bang hội khác nhau. Để chính thức gia nhập một bang
            hội, đơn xin của người chơi cần được phê duyệt bởi bang chủ hoặc đại
            trưởng lão của bang hội đó. Sau khi được phê duyệt, người chơi mới
            có thể trở thành thành viên chính thức của bang hội.
          </Banner>

          {clans.length > 0 ? (
            clans.map((clan, index) => (
              <ClanCard
                key={clan.id}
                bgColor={index % 2 === 0 ? "#f0f0f0" : "#e0e0e0"}
              >
                <div>
                  <p>Tên bang: {clan.name}</p>
                  <p>Bang chủ: {clanOwners[clan.owner] || "Loading..."}</p>
                  <p>Điểm cống hiến: {clan.contributionPoints}</p>
                </div>
                {clan.id === currentClanId ? (
                  <LeaveButton onClick={() => handleLeaveClan(clan.id)}>
                    Thoát bang
                  </LeaveButton>
                ) : (
                  <JoinButton
                    onClick={() => handleJoinClan(clan.id)}
                    // disabled={currentClanId && currentClanId !== clan.id}
                  >
                    Xin vào
                  </JoinButton>
                )}
              </ClanCard>
            ))
          ) : (
            <p>Không có bang hội nào để hiển thị</p>
          )}
        </>
      )}
    </Container>
  );
};

export default XinVaoBang;
