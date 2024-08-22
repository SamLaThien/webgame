import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import bcrypt from "bcryptjs"; // Import bcrypt for password comparison

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

const SearchInput = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
`;

const ItemCard = styled.div`
  border: 1px dashed #ddd;
  border-right-width: 0;
  border-bottom-width: 0;
  padding: 10px;
  position: relative;
  background-color: white;

  &:nth-child(4n) {
    border-right-width: 1px;
  }

  &:nth-last-child(-n + 4) {
    border-bottom-width: 1px;
  }
`;

const ItemName = styled.h3`
  font-size: 16px;
  margin-bottom: 5px;
`;

const ItemQuantity = styled.span`
  background-color: #ff9800;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  position: absolute;
  top: 10px;
  right: 10px;
`;

const ExpGainText = styled.p`
  font-size: 14px;
  color: #777;
  margin-bottom: 10px;
`;

const Input = styled.input`
  padding: 5px;
  margin-bottom: 10px;
  width: 100%;
  border: 1px solid #ccc;
  box-sizing: border-box;
`;

const TransferButton = styled.button`
  padding: 10px;
  width: 100%;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #388e3c;
  }
`;

const PasswordInput = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
`;

const BaoKhoPhong = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userInfo = await axios.get(`/api/user/clan/user-info`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(userInfo.data);

          if (
            parseInt(userInfo.data.clan_role) !== 6 &&
            parseInt(userInfo.data.clan_role) !== 7
          ) {
            router.push("/ho-so");
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handlePasswordSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User is not logged in");
        return;
      }

      const response = await axios.get(`/api/user/clan/get-clan-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const isPasswordMatch = await bcrypt.compare(
        password,
        response.data.password
      );

      if (isPasswordMatch) {
        setIsAuthenticated(true);
        const { data } = await axios.get(`/api/user/clan/ruong-do`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(data);
        setFilteredItems(data);
      } else {
        alert("Incorrect password.");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
    }
  };

  useEffect(() => {
    const results = items.filter((item) => {
      const itemName = item.vat_pham_name || "";
      return itemName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredItems(results);
  }, [searchTerm, items]);

  const handleTransferItem = async (vatPhamId, soLuong, memberId) => {
    if (!soLuong || !memberId || soLuong <= 0 || memberId <= 0) {
      alert('Please enter valid quantity and member ID.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User is not logged in');
        return;
      }
  
      const { data } = await axios.post(
        '/api/user/clan/transfer',
        {
          vatPhamId,
          soLuong: parseInt(soLuong, 10),
          memberId: parseInt(memberId, 10),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (data.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.vat_pham_id === vatPhamId
              ? { ...item, so_luong: item.so_luong - soLuong }
              : item
          )
        );
        alert('Item transferred successfully!');
      } else {
        alert(data.message || 'Error transferring item');
      }
    } catch (error) {
      console.error('Error transferring item:', error);
    }
  };
  

  if (!isAuthenticated) {
    return (
      <Container>
        <Title>Enter Clan Password</Title>
        <PasswordInput
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TransferButton onClick={handlePasswordSubmit}>Submit</TransferButton>
      </Container>
    );
  }

  return (
    <>
      <Title>
        <Inventory2OutlinedIcon /> Bảo Khố Phòng
      </Title>
      <Container>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm vật phẩm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ItemGrid>
          {filteredItems.map((item) => (
            <ItemCard key={item.id}>
              <ItemName>{item.Name}</ItemName>
              <ItemQuantity>Số lượng: {item.so_luong}</ItemQuantity>
              <ExpGainText>Sử dụng sẽ tăng thêm: 200 exp</ExpGainText>

              {/* Input for quantity to transfer */}
              <Input
                type="number"
                placeholder="Số lượng"
                value={item.transferQuantity || ""}
                onChange={(e) => {
                  const newItems = filteredItems.map((i) =>
                    i.id === item.id
                      ? { ...i, transferQuantity: e.target.value }
                      : i
                  );
                  setFilteredItems(newItems);
                }}
              />

              {/* Input for the recipient's user ID */}
              <Input
                type="number"
                placeholder="ID Thành Viên"
                value={item.transferMemberId || ""}
                onChange={(e) => {
                  const newItems = filteredItems.map((i) =>
                    i.id === item.id
                      ? { ...i, transferMemberId: e.target.value }
                      : i
                  );
                  setFilteredItems(newItems);
                }}
              />

              <TransferButton
                onClick={() =>
                  handleTransferItem(
                    item.vat_pham_id,
                    item.transferQuantity,
                    item.transferMemberId
                  )
                }
              >
                Chuyển
              </TransferButton>
            </ItemCard>
          ))}
        </ItemGrid>
      </Container>
    </>
  );
};

export default BaoKhoPhong;
