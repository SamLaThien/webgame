import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import cryptoJs from "crypto-js";
import { useRouter } from "next/router";
import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");
const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
  height: 110%;
  @media (max-width: 749px) {
    flex-direction: column;
  }
`;

const ChatSection = styled.div`
  flex: 1;
  padding: 20px;
  background-color: white;
  border: 1px solid #93b6c8;
  width: 20vw;
  @media (max-width: 749px) {
    width: 90vw;
    box-sizing: border-box;
  }
`;

const ActivitySection = styled.div`
  width: 300px;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #93b6c8;
  width: 25vw;
  @media (max-width: 749px) {
    width: 90vw;
    box-sizing: border-box;
  }
`;

const SectionTitle = styled.h2`
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

const ChannelSelector = styled.div`
  display: flex;
  justify-content: left;
  margin-bottom: 20px;
`;

const ChannelButton = styled.button`
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

const ChatBox = styled.iframe`
  width: 100%;
  height: calc(100vh - 160px);
  border: none;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActivityItem = styled.div`
  background-color: ${({ color }) => color || "#eee"};
  color: black;
  padding: 10px;
  margin-bottom: 10px;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: left;
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

const TabContent = styled.div`
  display: ${(props) => (props.active ? "block" : "none")};
  border-radius: 0 0 8px 8px;
  padding: 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px;
  margin: 0;
  border: 1px solid #ddd;
  box-sizing: border-box;
  height: 100%;
  font-size: 16px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  margin-bottom: 10px;

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

const NghiSuDien = () => {
  const [selectedChannel, setSelectedChannel] = useState("kenhMonPhai");
  const [activities, setActivities] = useState([]);
  const [cboxThreadId, setCboxThreadId] = useState(null);
  const [cboxThreadKey, setCboxThreadKey] = useState(null);
  const [activeTab, setActiveTab] = useState("hoatDong");
  const [user, setUser] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const router = useRouter();
  const [donationAmount, setDonationAmount] = useState("");

  useEffect(() => {
    const fetchClanChatInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(`/api/user/clan/cbox`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const activityResponse = await axios.get(
            `/api/user/clan/activity-logs`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setActivities(activityResponse.data);
          const { cbox_thread_id, cbox_thread_key } = response.data;
          setCboxThreadId(cbox_thread_id);
          setCboxThreadKey(cbox_thread_key);
        }
      } catch (error) {
        console.error("Error fetching clan chat info:", error);
      }
    };

    fetchClanChatInfo();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userInfo = await axios.get(`/api/user/clan/user-info`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setUser(userInfo.data);

          // if (
          //   parseInt(userInfo.data.clan_role) !== 6 &&
          //   parseInt(userInfo.data.clan_role) !== 7
          // ) {
          //   router.push("/ho-so");
          // }

          const membersInfo = await axios.get(`/api/user/clan/members`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setMembers(membersInfo.data);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserData();
  }, []);
  useEffect(() => {
    const reloadInterval = setInterval(() => {
      router.reload(); 
    }, 120000); 

    return () => clearInterval(reloadInterval);
  }, [router]);
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
        

        if (seconds !== 0 && seconds % 1 === 0) {
          updateExp();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [user, seconds]);

  const updateExp = async () => {
    const userLevel = user?.level;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/user/dot-pha/update",
         { level: userLevel },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setUser((prevUser) => ({
          ...prevUser,
          exp: prevUser.exp + response.data.expAdded,
        }));
      } else {
        console.error("Failed to update exp:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating exp:", error);
    }
  };

  const handleMoneyDonation = async () => {
    const minimumAmount = 100;

  if (
    !donationAmount ||
    isNaN(donationAmount) ||
    Number(donationAmount) < minimumAmount
  ) {
    alert(`Please enter a valid amount. The minimum amount is ${minimumAmount}.`);
    return;
  }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User is not authenticated");
        return;
      }

      const response = await axios.get(`/api/user/clan/get-clan-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        const { accountant_id } = response.data;
        const { data } = await axios.post(
          "/api/user/clan/donate-money",
          {
            amount: Number(donationAmount),
            accountantId: accountant_id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.message === "Donation successful") {
          alert("Money donated successfully!");
          setDonationAmount("");
        } else {
          alert(data.message || "Error during donation");
        }
      } else {
        alert("Clan information could not be retrieved.");
      }
    } catch (error) {
      console.error("Error donating money:", error);
      alert("An error occurred during the donation process.");
    }
  };

  const getChatBoxUrl = () => {
    if (!user) {
      console.error("User object is null or undefined");
      return "";
    }
    const baseUrl = process.env.NEXT_PUBLIC_CBOX_BASE_URL;
    const cboxBoxId = process.env.NEXT_PUBLIC_CBOX_BOXID;
    const cboxBoxTag = process.env.NEXT_PUBLIC_CBOX_BOXTAG;
    const ngoaiHieu = user.ngoai_hieu || user.username || "default_username";
    const secret = "Y5tLcYKb2VsVwXyJ";

    const params = {
      boxid: cboxBoxId,
      boxtag: cboxBoxTag,
      nme: ngoaiHieu,
      lnk: `https://tuchangioi.xyz/member/${user?.id}`,
      pic: "",
    };

    if (selectedChannel === "kenhMonPhai" && cboxThreadId && cboxThreadKey) {
      params.tid = cboxThreadId;
      params.tkey = cboxThreadKey;
    }

    const queryString = Object.keys(params)
      .filter((key) => params[key])
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const path = `/box/?${queryString}`;

    const sig = encodeURIComponent(
      cryptoJs.enc.Base64.stringify(cryptoJs.HmacSHA256(path, secret))
    );

    return `${baseUrl}${path}&sig=${sig}`;
  };

  return (
    <>
      <SectionTitle>
        <ViewInArOutlinedIcon />
        Nghị Sự Điện
      </SectionTitle>

      <Container>
        <ChatSection>
          <ChannelSelector>
            <ChannelButton
              active={selectedChannel === "kenhMonPhai"}
              onClick={() => setSelectedChannel("kenhMonPhai")}
            >
              Kênh Môn Phái
            </ChannelButton>
            <ChannelButton
              active={selectedChannel === "kenhTheGioi"}
              onClick={() => setSelectedChannel("kenhTheGioi")}
            >
              Kênh Thế Giới
            </ChannelButton>
          </ChannelSelector>
          <ChatBox src={getChatBoxUrl()} title="Chat Box" />
        </ChatSection>
        <ActivitySection>
          <Tabs>
            <Tab
              active={activeTab === "hoatDong"}
              onClick={() => setActiveTab("hoatDong")}
            >
              Hoạt Động
            </Tab>
            <Tab
              active={activeTab === "khoBac"}
              onClick={() => setActiveTab("khoBac")}
            >
              Kho Bạc
            </Tab>
          </Tabs>
          <TabContent active={activeTab === "hoatDong"}>
            <ActivityList>
              {activities
                .filter((activity) => activity.action_type !== "Donate Money")
                .map((activity) => {
                  const timeAgo = moment(activity.timestamp).fromNow();
                  return (
                    <ActivityItem key={activity.id} color={activity.color}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: activity.action_details,
                        }}
                      />{" "}
                      ({timeAgo})
                    </ActivityItem>
                  );
                })}
            </ActivityList>
          </TabContent>
          <TabContent active={activeTab === "khoBac"}>
            <Input
              type="text"
              placeholder="Nhập số bạc bạn muốn nộp"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
            />
            <Button onClick={handleMoneyDonation}>Nộp</Button>
            <ActivityList>
              {activities
                .filter((activity) => activity.action_type === "Donate Money")
                .map((activity) => {
                  const timeAgo = moment(activity.timestamp).fromNow();
                  return (
                    <ActivityItem key={activity.id} color={activity.color}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: activity.action_details,
                        }}
                      />{" "}
                      ({timeAgo})
                    </ActivityItem>
                  );
                })}
            </ActivityList>
          </TabContent>
        </ActivitySection>
      </Container>
    </>
  );
};

export default NghiSuDien;
