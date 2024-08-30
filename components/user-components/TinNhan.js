import React, { useEffect, useState } from "react";
import styled from "styled-components";
import InsertCommentOutlinedIcon from "@mui/icons-material/InsertCommentOutlined";
import axios from "axios";

const Container = styled.div`
  background: white;
  padding: 20px;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
`;

const Title = styled.h2`
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

const Banner = styled.div`
  background-color: ${(props) => props.bgColor || "transparent"};
  color: ${(props) => (props.bgColor === "#f8d7da" ? "black" : "black")};
  padding: 10px;
  border-radius: 5px;
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
  border: 1px solid #93b6c8;
  padding: 20px;
  background-color: #f9f9f9;
`;

const LogEntry = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #93b6c8;
  padding: 10px;
`;

const LogTimestamp = styled.span`
  padding: 0;
`;

const LogMessage = styled.span`
  margin-left: 20px;
  flex: 1;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const PaginationButton = styled.button`
  padding: 5px 10px;
  margin: 0 5px;
  background-color: #0070f3;
  color: white;
  border: none;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #005bb5;
  }
`;
const Logs = styled.div`  
  padding: 0;
`;
const TinNhan = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  useEffect(() => {
    const fetchUserLogs = async () => {
      try {
        const token = localStorage.getItem('token'); 
        if (token) {
          const { data } = await axios.get(`/api/user/log/get-log-by-id`, {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          });
          setLogs(data.logs);
        }
      } catch (error) {
        console.error("Error fetching user logs:", error);
      }
    };

    if (activeTab === "system") {
      fetchUserLogs();
    }
  }, [activeTab]);

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  const totalPages = Math.ceil(logs.length / logsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <>
      <Title>
        <InsertCommentOutlinedIcon />
        TIN NHẮN
      </Title>
      <Container>
        <Banner bgColor="#d1e7dd">
          - Tin nhắn HỆ THỐNG của tất cả mọi người sẽ luôn hiển thị 300 tin chia
          làm 10 trang. Trang nào trắng nghĩa là số lượng tin nhắn của bạn chưa
          đủ 300 tin để được lưu tới trang đó.
          <br />
          - Lưu ý không đưa mật khẩu cho bất cứ ai, kể cả admin hay smod hỏi mật
          khẩu của bạn. Nếu có người hỏi mật khẩu của bạn hãy liên hệ ngay cho
          BQT.
          <br />- Mật khẩu không nên đặt đơn giản để tránh kẻ gian lợi dụng mở
          ra.
        </Banner>
        <Banner bgColor="#f8d7da">
          Quy tắc xử lý khi phát sinh tranh chấp trong mua bán Tài khoản - Bạc -
          Vật phẩm:{" "}
          <a
            href="https://forum.tutiengame.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://forum.tuchangioi.xyz
          </a>
        </Banner>
        <Tabs>
          <Tab
            active={activeTab === "friends"}
            onClick={() => setActiveTab("friends")}
          >
            Bạn Bè
          </Tab>
          <Tab
            active={activeTab === "system"}
            onClick={() => setActiveTab("system")}
          >
            Hệ Thống
          </Tab>
        </Tabs>
        <TabContent active={activeTab === "friends"}>
          {/* Add your friends tab content here */}
        </TabContent>
        <TabContent active={activeTab === "system"}>
          {currentLogs.length > 0 ? (
            <Logs>
              {currentLogs.map((log, index) => (
                <LogEntry key={index}>
                  <LogTimestamp>{formatDate(log.timestamp)}</LogTimestamp>
                  <LogMessage dangerouslySetInnerHTML={{ __html: `Đạo hữu ${log.action_details}` }} />
                </LogEntry>
              ))}
            </Logs>
          ) : (
            <p>No logs available.</p>
          )}
          <PaginationContainer>
            <PaginationButton
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </PaginationButton>
            <PaginationButton
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </PaginationButton>
          </PaginationContainer>
        </TabContent>
      </Container>
    </>
  );
};

export default TinNhan;
