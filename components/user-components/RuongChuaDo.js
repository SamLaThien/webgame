import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

const Container = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-radius: 0;
  margin-bottom: 20px;
  width: 100%;
  border: 1px solid #93b6c8;
  box-sizing: border-box;
  font-size: 16px;
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

const Banner = styled.div`
  background-color: ${({ color }) => color || "#0070f3"};
  color: white;
  padding: 10px;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
  text-align: center;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
`;

const Tab = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  color: ${({ isActive }) => (isActive ? "#93b6c8" : "#333")};
  border-bottom: ${({ isActive }) => (isActive ? "2px solid #93b6c8" : "none")};

  &:hover {
    color: #93b6c8;
  }
`;

const ItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background-color: #f3f3f3;
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
`;

const TableRow = styled.tr`
  border: 1px solid #ddd;
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
  vertical-align: top;
  width: ${({ width }) => width || "auto"};
`;

const ActionButton = styled.button`
  padding: 5px 10px;
  margin: 5px;
  background-color: ${({ color }) => color || "#0070f3"};
  color: white;
  border: none;
  cursor: pointer;
  width: 100px;
  &:hover {
    background-color: ${({ hoverColor }) => hoverColor || "#005bb5"};
  }
`;

const Input = styled.input`
  padding: 5px;
  width: 80px;
  margin-right: 10px;
`;

const RuongChuaDo = () => {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const { data } = await axios.get(
            `/api/user/ruong-do?userId=${storedUser.id}`
          );

          if (data.message) {
            setMessage(data.message); // Set the message if returned
          } else {
            setItems(data); // Set items if found
          }
        }
      } catch (error) {
        console.error("Error fetching ruong do items:", error);
      }
    };

    fetchItems();
  }, []);

  const handleUseItem = async (ruongDoId, vatPhamId, soLuong, isMultiple) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) return;

      const useAmount = isMultiple ? 10 : 1;

      if (soLuong < useAmount) {
        alert("Not enough items to use.");
        return;
      }

      const { data } = await axios.post("/api/user/ruong-do/use-item", {
        userId: storedUser.id,
        ruongDoId,
        vatPhamId,
        useAmount,
      });

      if (data.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.ruong_do_id === ruongDoId
              ? { ...item, so_luong: item.so_luong - useAmount }
              : item
          )
        );
      } else {
        alert(data.message || "Error using item");
      }
    } catch (error) {
      console.error("Error using item:", error);
    }
  };

  const categorizedItems = items.filter((item) => item.phan_loai === activeTab);

  const renderTabs = () => (
    <TabContainer>
      <Tab isActive={activeTab === 1} onClick={() => setActiveTab(1)}>
        Tăng Exp (Linh Lực)
      </Tab>
      <Tab isActive={activeTab === 2} onClick={() => setActiveTab(2)}>
        Tăng HP
      </Tab>
      <Tab isActive={activeTab === 3} onClick={() => setActiveTab(3)}>
        Công Pháp
      </Tab>
      <Tab isActive={activeTab === 4} onClick={() => setActiveTab(4)}>
        Đột Phá
      </Tab>
      <Tab isActive={activeTab === 5} onClick={() => setActiveTab(5)}>
        Binh Khí
      </Tab>
      <Tab isActive={activeTab === 6} onClick={() => setActiveTab(6)}>
        Khải Giáp
      </Tab>
      <Tab isActive={activeTab === 7} onClick={() => setActiveTab(7)}>
        Linh Thảo
      </Tab>
    </TabContainer>
  );

  return (
    <>
      <Title>
        {" "}
        <Inventory2OutlinedIcon /> Rương chứa đồ
      </Title>
      <Container>
        {renderTabs()}
        {message ? (
          <p>{message}</p>
        ) : (
          <ItemTable>
            <thead>
              <tr>
                <TableHeader style={{ width: "30%" }}>Vật phẩm</TableHeader>
                <TableHeader style={{ width: "30%" }}>
                  Giới thiệu và rao bán
                </TableHeader>
                <TableHeader style={{ width: "25%" }}>Sử dụng</TableHeader>
              </tr>
            </thead>
            <tbody>
              {categorizedItems.map((item) => (
                <TableRow key={item.ruong_do_id}>
                  <TableCell width="30%">
                    <div>
                      {item.vat_pham_name} ({item.so_luong})
                    </div>
                    <div>{item.PhamCap}</div>
                    <div>Hướng dẫn dùng: {item.SuDung}</div>
                  </TableCell>
                  <TableCell width="30%">
                    <Input placeholder="Số lượng" />
                    <Input placeholder="Số bạc/1c" />
                    <ActionButton color="#ff9800" hoverColor="#ff5722">
                      Rao bán
                    </ActionButton>
                    <Input placeholder="Số lượng" />
                    <Input placeholder="ID nhận" />
                    <ActionButton color="#f44336" hoverColor="#e53935">
                      Chuyển
                    </ActionButton>
                  </TableCell>
                  <TableCell width="25%">
                    <ActionButton
                      color="#4caf50"
                      hoverColor="#388e3c"
                      onClick={() =>
                        handleUseItem(
                          item.ruong_do_id,
                          item.vat_pham_id,
                          item.so_luong,
                          false
                        )
                      }
                    >
                      Sử dụng
                    </ActionButton>
                    <ActionButton
                      color="#4caf50"
                      hoverColor="#388e3c"
                      onClick={() =>
                        handleUseItem(
                          item.ruong_do_id,
                          item.vat_pham_id,
                          item.so_luong,
                          true
                        )
                      }
                    >
                      Sử dụng X10
                    </ActionButton>
                    <Input placeholder="Số lượng" />
                    <ActionButton color="#4caf50" hoverColor="#388e3c">
                      Hành trang
                    </ActionButton>
                    <Input placeholder="Số lượng" />
                    <ActionButton color="#f44336" hoverColor="#e53935">
                      Nộp bang
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </ItemTable>
        )}
      </Container>
    </>
  );
};

export default RuongChuaDo;
