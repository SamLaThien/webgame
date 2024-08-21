import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
import cryptoJs from "crypto-js";
import { useRouter } from "next/router";

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
  padding: 12px 20px;
  background-color: #B3D7E8;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background-color: #93B6C8;
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
  useEffect(() => {
    setActivities([
      {
        id: 1,
        text: "Đạo hữu Tôn Nợ 10k Bái vừa nộp bang 1 Tỉ Lôi Châu (còn 0) vào bảo khố (còn 16) (9 giờ trước)",
        color: "#a8dadc",
      },
      {
        id: 2,
        text: "Đạo hữu Tôn Nợ 10k Bái vừa nộp bang 14 Khai Thiên Thần Thạch (còn 0) vào bảo khố (còn 14) (9 giờ trước)",
        color: "#f4a261",
      },
      {
        id: 3,
        text: "Đạo hữu Tôn Nợ 10k Bái vừa nộp bang 14 Vạn Thiết CP (còn 0) vào bảo khố (còn 15) (9 giờ trước)",
        color: "#e9c46a",
      },
    ]);

    const fetchClanChatInfo = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const response = await axios.get(
            `/api/user/clan/cbox?userId=${storedUser.id}`
          );
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
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          const userInfo = await axios.get(`/api/user/clan/user-info?userId=${storedUser.id}`);
          setUser("This is info" + JSON.stringify(userInfo.data));
          console
          if (parseInt(userInfo.data.clan_role) !== 6 && parseInt(userInfo.data.clan_role) !== 7) {
            router.push('/ho-so');
          }
          const membersInfo = await axios.get(`/api/user/clan/members?userId=${storedUser.id}`);
          setMembers(membersInfo.data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("Starting timer for EXP update...");
      const interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
        console.log(
          `Timer: ${Math.floor(seconds / 60)} minute(s) and ${
            seconds % 60
          } second(s)`
        );

        if (seconds !== 0 && seconds % 1800 === 0) {
          console.log("10 seconds reached. Preparing to update EXP...");
          updateExp();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [user, seconds]);

  const updateExp = async () => {
    try {
      const cap = Math.floor(user.level / 10) + 1;
      let tile = 1; 

      switch (cap) {
        case 1:
          tile = 1.1;
          break;
        case 2:
          tile = 1.2;
          break;
        case 3:
          tile = 1.3;
          break;
        case 4:
          tile = 2.6;
          break;
        case 5:
          tile = 4.2;
          break;
        case 6:
          tile = 10.5;
          break;
        case 7:
          tile = 21;
          break;
        case 8:
          tile = 70;
          break;
        case 9:
          tile = 210;
          break;
        default:
          tile = 1;
      }

      const expToAdd = 1 / (48 * tile);
      const response = await axios.post("/api/user/dot-pha/update", {
        userId: user.id,
        expToAdd: expToAdd,
      });

      setUser((prevUser) => ({ ...prevUser, exp: prevUser.exp + expToAdd }));
    } catch (error) {
      console.error("Error updating exp:", error);
    }
  };


const getChatBoxUrl = () => {
  if (!user) {
    console.error("User object is null or undefined");
    return '';
  }
    const baseUrl = process.env.NEXT_PUBLIC_CBOX_BASE_URL;
    const cboxBoxId = process.env.NEXT_PUBLIC_CBOX_BOXID;
    const cboxBoxTag = process.env.NEXT_PUBLIC_CBOX_BOXTAG;
    const ngoaiHieu = user.ngoai_hieu || user.username || 'default_username';    const secret = "Y5tLcYKb2VsVwXyJ";  // Your secret key

    // Define the parameters
    const params = {
        boxid: cboxBoxId,
        boxtag: cboxBoxTag,
        nme: ngoaiHieu,
        lnk: '',  // Profile URL (optional)
        pic: ''   // Avatar URL (optional)
    };

    if (selectedChannel === "kenhMonPhai" && cboxThreadId && cboxThreadKey) {
        params.tid = cboxThreadId;
        params.tkey = cboxThreadKey;
    }

    // Build the query string
    const queryString = Object.keys(params)
        .filter(key => params[key])
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

    // Create the path
    const path = `/box/?${queryString}`;

    // Generate the signature using HMAC-SHA256
    const sig = encodeURIComponent(cryptoJs.enc.Base64.stringify(cryptoJs.HmacSHA256(path, secret)));

    // Construct the full URL with the signature
    return `${baseUrl}${path}&sig=${sig}`;
};

  return (
    <>
      <SectionTitle><ViewInArOutlinedIcon/>Nghị Sự Điện</SectionTitle>

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
              {activities.map((activity) => (
                <ActivityItem key={activity.id} color={activity.color}>
                  {activity.text}
                </ActivityItem>
              ))}
            </ActivityList>
          </TabContent>
          <TabContent active={activeTab === "khoBac"}>
          <Input
              type="text"
              placeholder="Nhập số bạc bạn muốn nộp"
            />
            <Button >Nộp</Button>
          </TabContent>
        </ActivitySection>
      </Container>
    </>
  );
};

export default NghiSuDien;
