import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { useRouter } from "next/router";
import jwt from "jsonwebtoken";
import { expItems } from "@/utils/expItem";

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
  margin: 0;
  margin-right: 10px;
  margin-bottom: 10px;
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
  padding: 5px 10px;
  width: 75px;
  margin-right: 10px;
  margin-bottom: 10px;
`;

const RuongChuaDo = () => {
  const [items, setItems] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [message, setMessage] = useState("");
  const [donationAmount, setDonationAmount] = useState({});
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchItems = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const { data } = await axios.get("/api/user/ruong-do", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems(data);
    } catch (error) {
      console.error("Error fetching ruong do items:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decodedToken = jwt.decode(token);
          if (decodedToken && decodedToken.userId) {
            const { data: userData } = await axios.get(
              `/api/user/clan/user-info?userId=${decodedToken.userId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            console.log("Test", userData);

            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const validateTokenAndFetchItems = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const { data } = await axios.get("/api/user/validate-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!data.isValid) {
          router.push("/login");
          return;
        }

        await fetchItems();
      } catch (error) {
        console.error("Error during token validation or item fetching:", error);
        router.push("/login");
      }
    };

    validateTokenAndFetchItems();

    // Polling to fetch updated items every 10 seconds
    const intervalId = setInterval(fetchItems, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [router]);
  // useEffect(() => {
  //   const fetchItems = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const { data } = await axios.get('/api/user/ruong-do', {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       setItems(data);
  //     } catch (error) {
  //       console.error("Error fetching ruong do items:", error);
  //     }
  //   };

  //   fetchItems();
  // }, []);

  const logUserActivity = async (actionType, actionDetails) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "/api/user/log/log-ruong-do",
        {
          actionType,
          actionDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error logging user activity:", error);
    }
  };

  const handleUseItem = async (ruongDoId, vatPhamId, soLuong, isMultiple) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const useAmount = isMultiple ? 10 : 1;

      if (soLuong < useAmount) {
        alert("Đạo hữu không đủ vật phẩm để sử dụng.");
        return;
      }

      const response = await axios.post(
        "/api/user/ruong-do/use-item",
        {
          ruongDoId,
          vatPhamId,
          useAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.ruong_do_id === ruongDoId
              ? { ...item, so_luong: item.so_luong - useAmount }
              : item
          )
        );

        const itemName =
          items.find((item) => item.vat_pham_id === vatPhamId)?.vat_pham_name ||
          "Unknown Item";
        const expGained = item?.SuDung || 0;
        alert(`Đạo hữu vừa sử dụng ${itemName} ${useAmount}.`);

        await logUserActivity(
          "Item Use",
          `Đạo hữu vừa sử dụng ${itemName} ${useAmount}, nhận được ${expGained} EXP.`
        );
      } else {
        alert(response.data.message || "Error using item");
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert(error.response.data.message);
      } else {
        console.error("Error using item:", error);
        alert("Item used successfully");
      }
    }
  };

  const handleDonationAmountChange = (e, vatPhamId) => {
    const value = e.target.value;
    setDonationAmount((prev) => ({ ...prev, [vatPhamId]: value }));
  };

  const handleDonateItem = async (ruongDoId, vatPhamId, availableQuantity) => {
    const amountToDonate = parseInt(donationAmount[vatPhamId]);

    if (!amountToDonate || amountToDonate <= 0) {
      alert("Đạo hữu không đủ vật phẩm để đóng góp.");
      return;
    }

    if (amountToDonate > availableQuantity) {
      alert("Đạo hữu không đủ vật phẩm để góp.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.post(
        "/api/user/ruong-do/donate-item",
        {
          ruongDoId,
          vatPhamId,
          donationAmount: parseInt(amountToDonate),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.ruong_do_id === ruongDoId
              ? { ...item, so_luong: item.so_luong - amountToDonate }
              : item
          )
        );
        alert("Đóng góp thành công!");
      } else {
        alert(
          data.message || "Sorry, unexpected error. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error donating item:", error);
    }
  };

  const calculateExpGain = (item, user) => {
    console.log("User data in calculateExpGain:", user);
    if (!user || !user.level) {
      return 0;
    }

    const userLevel = user.level;
    let levelRange;

    // Define the user level range
    if (userLevel <= 20) levelRange = "1-20";
    else if (userLevel <= 30) levelRange = "21-30";
    else if (userLevel <= 40) levelRange = "31-40";
    else if (userLevel <= 50) levelRange = "41-50";
    else if (userLevel <= 60) levelRange = "51-60";
    else if (userLevel <= 70) levelRange = "61-70";
    else if (userLevel <= 80) levelRange = "71-80";
    else if (userLevel <= 90) levelRange = "81-90";
    else if (userLevel <= 100) levelRange = "91-100";
    else if (userLevel <= 110) levelRange = "101-110";
    else if (userLevel <= 120) levelRange = "111-120";
    else if (userLevel <= 130) levelRange = "121-130";
    else return 0;

    // Find the item level range
    let itemLevelRange;
    for (const range in expItems) {
      if (expItems[range].includes(item.vat_pham_id)) {
        itemLevelRange = range;
        break;
      }
    }

    // Check if itemLevelRange is found
    if (!itemLevelRange) {
      console.error(
        `Item level range not found for vat_pham_id: ${item.vat_pham_id}`
      );
      return 0; // Return 0 if no range is found for the item
    }

    // Parse level ranges
    const userRangeStart = parseInt(levelRange.split("-")[0]);
    const itemRangeStart = parseInt(itemLevelRange.split("-")[0]);

    // Calculate reduction percentage
    let reductionPercentage =
      (Math.max(0, userRangeStart - itemRangeStart) / 10) * 10;
    if (reductionPercentage < 0) reductionPercentage = 0;

    // Return calculated EXP gain
    return item.SuDung * ((100 - reductionPercentage) / 100);
  };

  const categorizedItems = Array.isArray(items)
    ? items
        .filter((item) => item.phan_loai === activeTab && item.so_luong > 0)
        .sort((a, b) => a.vat_pham_name.localeCompare(b.vat_pham_name))
    : [];

  const renderTabs = () => {
    if (loading || !items || items.length === 0) {
      return null;
    }
    return (
      <TabContainer>
        <Tab isActive={activeTab === 1} onClick={() => setActiveTab(1)}>
          Tăng Exp (Linh Lực)
        </Tab>
        <Tab isActive={activeTab === 2} onClick={() => setActiveTab(2)}>
          Tăng HP
        </Tab>
        <Tab isActive={activeTab === 3} onClick={() => setActiveTab(3)}>
          Đột Phá
        </Tab>
        <Tab isActive={activeTab === 7} onClick={() => setActiveTab(8)}>
          Linh Thảo{" "}
        </Tab>
        <Tab isActive={activeTab === 8} onClick={() => setActiveTab(8)}>
          Phụ Trợ
        </Tab>
      </TabContainer>
    );
  };

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
                <TableHeader style={{ width: "25%" }}>Vật phẩm</TableHeader>
                <TableHeader style={{ width: "35%" }}>
                  Giới thiệu và rao bán
                </TableHeader>
                <TableHeader style={{ width: "25%" }}>Sử dụng</TableHeader>
              </tr>
            </thead>
            <tbody>
              {categorizedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="3" style={{ textAlign: "center" }}>
                    Rương đồ trống
                  </TableCell>
                </TableRow>
              ) : (
                categorizedItems.map((item) => (
                  <TableRow key={item.ruong_do_id}>
                    <TableCell width="30%">
                      <div>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: `${item.vat_pham_name} (${item.so_luong})`,
                          }}
                        />
                      </div>
                      <div>{item.PhamCap}</div>
                      {item.SuDung && (
                        <div>
                          Sử dụng nhận được {calculateExpGain(item, user)} EXP.
                        </div>
                      )}
                    </TableCell>
                    <TableCell width="30%">
                      <Input placeholder="Số lượng" />
                      <Input placeholder="Số bạc/1c" />
                      <ActionButton color="#ff9800" hoverColor="#ff5722">
                        Rao bán
                      </ActionButton>
                    </TableCell>
                    <TableCell width="25%">
                      {item.SuDung && (
                        <>
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
                        </>
                      )}
                      <Input
                        type="number"
                        placeholder="Số lượng"
                        value={donationAmount[item.vat_pham_id] || ""}
                        onChange={(e) =>
                          handleDonationAmountChange(e, item.vat_pham_id)
                        }
                      />
                      <ActionButton
                        color="#f44336"
                        hoverColor="#e53935"
                        onClick={() =>
                          handleDonateItem(
                            item.ruong_do_id,
                            item.vat_pham_id,
                            item.so_luong
                          )
                        }
                      >
                        Nộp bang
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </ItemTable>
        )}
      </Container>
    </>
  );
};

export default RuongChuaDo;
