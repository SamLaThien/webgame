import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
  height: 110%;
`;

const ChatSection = styled.div`
  flex: 1;
  padding: 20px;
  background-color: white;
  border: 1px solid #93b6c8;
  width: 20vw;
`;

const ActivitySection = styled.div`
  width: 300px;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #93b6c8;
  width: 25vw;
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
  padding: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px;
  margin: 10px 0;
  border: 1px solid #ddd;
  box-sizing: border-box;
  height: 100%;
  font-size: 16px;
  margin-right: 10px;
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

  const getChatBoxUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_CBOX_BASE_URL;
    const cboxBoxId = process.env.NEXT_PUBLIC_CBOX_BOXID;
    const cboxBoxTag = process.env.NEXT_PUBLIC_CBOX_BOXTAG;

    if (selectedChannel === "kenhMonPhai" && cboxThreadId && cboxThreadKey) {
      return `${baseUrl}/box/?boxid=${cboxBoxId}&boxtag=${cboxBoxTag}&tid=${cboxThreadId}&tkey=${cboxThreadKey}`;
    } else {
      return `${baseUrl}/box/?boxid=${cboxBoxId}&boxtag=${cboxBoxTag}`;
    }
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
