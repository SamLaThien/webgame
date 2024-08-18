import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import BoltIcon from "@mui/icons-material/Bolt";
import { Bolt, Error } from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";
import { levelItemChances, consistentItemChances } from '@/utils/levelItemChances';

const Container = styled.div`
  background: white;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 12px;
  border-radius: 0;
  margin-bottom: 20px;
  width: 100%;
  border: 1px solid #93b6c8;
  box-sizing: border-box;
  font-size: 16px;
`;

const MainContent = styled.div`
  flex: 1;
`;

const InfoContent = styled.div`
  padding: 0;
  border-radius: 8px;
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

const ProgressBar = styled.div`
  width: 100%;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const Progress = styled.div`
  width: ${({ width }) => width}%;
  background: #4caf50;
  height: 20px;
`;

const Info = styled.p`
  margin: 10px 0;
  span {
    font-weight: bold;
    color: #0070f3;
  }
`;

const MandatoryItems = styled.p`
  margin: 10px 0;
  color: red;
  font-weight: bold;
`;

const DotPhaButton = styled.button`
  background: ${({ disabled }) => (disabled ? "#ccc" : "#f44336")};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-size: 16px;
  margin-top: 20px;
  width: 100%;
`;

const Notice = styled.div`
  margin-top: 20px;
  font-size: 12px;
  color: #555;
`;

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: row;
  @media (max-width: 749px) {
    flex-direction: column;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const CheckboxLabel = styled.label`
  margin-left: 8px;
`;

const ContainerWrapper = styled.div``;

const DotPha = () => {
  const [user, setUser] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    const fetchUserAndLevel = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const { data: userData } = await axios.get(`/api/user/clan/user-info?userId=${storedUser.id}`);
          setUser(userData);

          const { data: fetchedLevelData } = await axios.post(`/api/user/dot-pha/level-info`, { level: userData.level });
          setLevelData(fetchedLevelData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndLevel();
  }, []);

  const handleCheckboxChange = (itemId) => {
    setCheckedItems(prevState => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  const handleLevelUp = async () => {
    if (user && levelData && user.exp >= levelData.exp) {
        try {
            const requiredItemIds = levelData.vatpham_bat_buoc_id ? levelData.vatpham_bat_buoc_id.split(",") : [];

            // Check for required items only if they exist
            if (requiredItemIds.length > 0) {
                const { data: requiredItemsData } = await axios.get(`/api/user/dot-pha/check-required-item`, {
                    params: {
                        userId: user.id,
                        itemIds: requiredItemIds.join(","),
                    },
                });

                if (!requiredItemsData.hasRequiredItems) {
                    alert("Bạn không có đủ vật phẩm bắt buộc để Đột Phá.");
                    return;
                }
            }

            let successChance = levelData.ty_le_dot_pha_thanh_cong;
            console.log("Base ti le dot pha thanh cong:", successChance);

            const levelRangeKey = Object.keys(levelItemChances).find((range) => {
                const [min, max] = range.split('-').map(Number);
                return user.level >= min && user.level <= max;
            });

            // Collecting selected item IDs that the user opted to use
            const selectedItems = Object.keys(checkedItems).filter(itemId => checkedItems[itemId]);

            if (selectedItems.length > 0) {
                const { data: usedItemsData } = await axios.get(`/api/user/dot-pha/check-used-items`, {
                    params: {
                        userId: user.id,
                        usedItemIds: selectedItems.join(","),
                    },
                });

                // Apply success chance boosts based on items the user opted to use
                usedItemsData.forEach(item => {
                    const itemChance = levelItemChances[levelRangeKey]?.[item.vat_pham_id] || consistentItemChances[item.vat_pham_id];
                    if (itemChance) {
                        successChance += itemChance;
                        console.log(`Added chance from item ${item.vat_pham_id}:`, itemChance, "New successChance:", successChance);
                    }
                });
            }

            // Generate a random number between 0 and 100 to determine success
            const randomChance = Math.random() * 100;
            console.log("Random chance:", randomChance);

            if (randomChance <= successChance) {
                const nextLevel = user.level + 1;
                const newTaiSan = user.tai_san + levelData.bac_nhan_duoc_khi_dot_pha;

                await axios.post("/api/user/dot-pha/level-up", {
                    userId: user.id,
                    newLevel: nextLevel,
                    newTaiSan,
                    expUsed: levelData.exp,
                    currentExp: user.exp,
                });

                setUser((prevUser) => ({
                    ...prevUser,
                    level: nextLevel,
                    exp: prevUser.exp - levelData.exp,
                    tai_san: newTaiSan,
                }));

                const { data: fetchedLevelData } = await axios.post(`/api/user/dot-pha/level-info`, { level: nextLevel });
                setLevelData(fetchedLevelData);

                alert("Đột phá thành công!");
            } else {
                const expLoss = Math.floor(user.exp * (levelData.dot_pha_that_bai_mat_exp_percent / 100));
                const newExp = Math.max(0, user.exp - expLoss);

                setUser((prevUser) => ({
                    ...prevUser,
                    exp: newExp,
                }));

                alert(`Đột phá thất bại! Bạn đã mất ${expLoss} kinh nghiệm.`);
            }

        } catch (error) {
            console.error("Error handling Đột Phá:", error);
            alert("Đã xảy ra lỗi trong quá trình Đột Phá. Vui lòng thử lại.");
        }
    }
};


  
  
  
  

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (!user || !levelData) {
    return <Container>Error loading data.</Container>;
  }

  const expProgress = (user.exp / levelData.exp) * 100;
  const canLevelUp = user.exp >= levelData.exp;

  const levelRangeKey = Object.keys(levelItemChances).find((range) => {
    const [min, max] = range.split('-').map(Number);
    return user.level >= min && user.level <= max;
  });

  return (
    <>
      <Wrapper>
        <ContainerWrapper>
          <Title>
            <Bolt /> ĐỘT PHÁ & ĐỘ KIẾP
          </Title>
          <Container>
            <MainContent>
              <Info>
                Cảnh giới hiện tại: <span>{levelData.tu_vi}</span>
              </Info>
              <Info>Tiến độ tu luyện</Info>
              <ProgressBar>
                <Progress width={expProgress} />
              </ProgressBar>
              <Info>
                {user.exp}/{levelData.exp}
              </Info>
              <MandatoryItems>
                Vật phẩm bắt buộc: {levelData.vatpham_bat_buoc}
              </MandatoryItems>
              <Info>Vật phẩm phụ trợ tăng tỉ lệ thành công:</Info>
              {Object.entries(levelItemChances[levelRangeKey]).map(([itemId, itemChance]) => (
                <CheckboxContainer key={itemId}>
                  <input
                    type="checkbox"
                    id={`item-${itemId}`}
                    checked={!!checkedItems[itemId]}
                    onChange={() => handleCheckboxChange(itemId)}
                  />
                  <CheckboxLabel htmlFor={`item-${itemId}`}>
                    {getItemNameById(itemId)} ({itemChance > 0 ? `+${itemChance}%` : "Không khả dụng ở cấp này"})
                  </CheckboxLabel>
                </CheckboxContainer>
              ))}
              {Object.entries(consistentItemChances).map(([itemId, itemChance]) => (
                <CheckboxContainer key={itemId}>
                  <input
                    type="checkbox"
                    id={`item-${itemId}`}
                    checked={!!checkedItems[itemId]}
                    onChange={() => handleCheckboxChange(itemId)}
                  />
                  <CheckboxLabel htmlFor={`item-${itemId}`}>
                    {getItemNameById(itemId)} (+{itemChance}%)
                  </CheckboxLabel>
                </CheckboxContainer>
              ))}
              <DotPhaButton onClick={handleLevelUp} disabled={!canLevelUp}>
                Đột phá
              </DotPhaButton>
              <Notice>
                - Các vật phẩm dùng để đột phá cảnh giới có thể kiếm tại vòng
                quay may mắn hoặc mua tại Hắc Thị
                <br />
                - Nếu đẳng cấp vật phẩm phụ trợ đạo hữu sử dụng thấp hơn tu vi
                hiện tại thì tỉ lệ tăng kinh nghiệm sẽ bị giảm xuống, trừ công
                pháp Vô Cấp
                <br />- Nếu đột phá thất bại, đạo hữu sẽ bị mất{" "}
                {levelData.dot_pha_that_bai_mat_exp_percent}% kinh nghiệm
              </Notice>
            </MainContent>
          </Container>
        </ContainerWrapper>
        <ContainerWrapper>
          <Title>
            <Error /> CẦN BIẾT
          </Title>
          <Container>
            <InfoContent>
              <p>
                Đạo hữu có thể tu luyện tăng kinh nghiệm bằng cách đọc truyện,
                bình luận bằng tài khoản truyencv, chơi game, tặng đấu, ném đá
                hoặc cắn thuốc.
              </p>
              <p>
                Lưu ý không được spam comment để cày kinh nghiệm, spam sẽ bị ban
                nick từ 1 tới 7 ngày tùy mức độ.
              </p>
              <p>
                Đạo hữu đang nhận kinh nghiệm nhanh hơn 0% so với người thường
                khi đọc truyện hoặc treo tài khoản tại Nghi Sự Đường.
              </p>
              <p>
                Nếu đẳng cấp công pháp đạo hữu đang sử dụng thấp hơn tu vi hiện
                tại thì tốc độ tăng kinh nghiệm sẽ bị giảm xuống, trừ công pháp
                Vô Cấp.
              </p>
              <p>
                Đọc truyện trên Động Thiên Phúc Địa App dùng app để đọc truyện
                sẽ được kinh nghiệm nhanh hơn tu luyện trên web.
              </p>
            </InfoContent>
          </Container>
        </ContainerWrapper>
      </Wrapper>
    </>
  );
};

export default DotPha;

const getItemNameById = (itemId) => {
  const itemNames = {
    35: 'Huyết Khí Đan',
    38: 'Đế Giai Thuẫn',
    39: 'Tị Lôi Châu',
    40: 'Thanh Tâm Đan',
    41: 'Hộ Linh Trận',
    42: 'Tân Lôi Trận',
    43: 'Sa Ngọc Châu',
    44: 'Hoàng Kim Lệnh',
    45: 'Hoả Ngọc Châu',
    // Add other items here as needed
  };
  return itemNames[itemId] || `Item ${itemId}`;
};
