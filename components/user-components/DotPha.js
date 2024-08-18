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
  const [seconds, setSeconds] = useState(0);
  const [hasItem1, setHasItem1] = useState(false);
  const [hasItem2, setHasItem2] = useState(false);
  const [isCheckedItem1, setIsCheckedItem1] = useState(false);
  const [isCheckedItem2, setIsCheckedItem2] = useState(false);

  useEffect(() => {
    console.log("Fetching user and level data...");
    const fetchUserAndLevel = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          console.log("User found in localStorage:", storedUser);
          const { data: userData } = await axios.get(
            `/api/user/clan/user-info?userId=${storedUser.id}`
          );
          console.log("User data fetched:", userData);
          setUser(userData);

          const { data: fetchedLevelData } = await axios.post(
            `/api/user/dot-pha/level-info`,
            { level: userData.level }
          );
          console.log("Level data fetched:", fetchedLevelData);
          setLevelData(fetchedLevelData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchUserItems = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.id) {
          throw new Error("User not found in local storage");
        }

        const userId = storedUser.id;
        const item1Id = 38; 
        const item2Id = 39; 

        const { data: usedItemsData } = await axios.get(`/api/user/dot-pha/check-used-items`, {
          params: {
            userId,
            usedItemIds: `${item1Id},${item2Id}`
          }
        });

        setHasItem1(usedItemsData.hasUsedItems);
        setHasItem2(usedItemsData.hasUsedItems);

      } catch (error) {
        console.error("Error fetching user items:", error);
      }
    };

    fetchUserItems();
    fetchUserAndLevel();
  }, []);

  const handleCheckboxChangeItem1 = () => {
    setIsCheckedItem1(!isCheckedItem1);
  };

  const handleCheckboxChangeItem2 = () => {
    setIsCheckedItem2(!isCheckedItem2);
  };
  // useEffect(() => {
  //   if (user) {
  //     console.log("Starting timer for EXP update...");
  //     const interval = setInterval(() => {
  //       setSeconds((prevSeconds) => prevSeconds + 1);
  //       console.log(
  //         `Timer: ${Math.floor(seconds / 60)} minute(s) and ${
  //           seconds % 60
  //         } second(s)`
  //       );

  //       if (seconds !== 0 && seconds % 1 === 0) {
  //         console.log("10 seconds reached. Preparing to update EXP...");
  //         updateExp();
  //       }
  //     }, 1000);

  //     return () => clearInterval(interval);
  //   }
  // }, [user, seconds]);

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

      console.log(`Calculated EXP to add: ${expToAdd}`);

      const response = await axios.post("/api/user/dot-pha/update", {
        userId: user.id,
        expToAdd: expToAdd,
      });

      console.log("API response:", response.data);

      setUser((prevUser) => ({ ...prevUser, exp: prevUser.exp + expToAdd }));
    } catch (error) {
      console.error("Error updating exp:", error);
    }
  };

  const handleLevelUp = async () => {
    if (user && levelData && user.exp >= levelData.exp) {
      try {
        const requiredItemIds = levelData.vatpham_bat_buoc ? levelData.vatpham_bat_buoc.split(",") : [];
  
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
  
        let levelRangeKey = Object.keys(levelItemChances).find((range) => {
          const [min, max] = range.split('-').map(Number);
          return user.level >= min && user.level <= max;
        });
  
        if (isCheckedItem1 && hasItem1) {
          const itemChance = levelItemChances[levelRangeKey][38];
          successChance += itemChance;
          console.log("Added chance from item 38:", itemChance, "New successChance:", successChance);
        }
  
        if (isCheckedItem2 && hasItem2) {
          const itemChance = levelItemChances[levelRangeKey][39];
          successChance += itemChance;
          console.log("Added chance from item 39:", itemChance, "New successChance:", successChance);
        }
  
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
  
          const { data: fetchedLevelData } = await axios.post(
            `/api/user/dot-pha/level-info`,
            { level: nextLevel }
          );
          setLevelData(fetchedLevelData);
  
          alert("Đột phá thành công!");
        } else {
          const expLoss = Math.floor(
            user.exp * (levelData.dot_pha_that_bai_mat_exp_percent / 100)
          );
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
              <CheckboxContainer>
                <input
                  type="checkbox"
                  id="item1"
                  checked={isCheckedItem1}
                  onChange={handleCheckboxChangeItem1}
                  disabled={!hasItem1} // Disable if the user doesn't have the item
                />
                <CheckboxLabel htmlFor="item1">Đế Giai Thuẫn</CheckboxLabel>
              </CheckboxContainer>
              <CheckboxContainer>
                <input
                  type="checkbox"
                  id="item2"
                  checked={isCheckedItem2}
                  onChange={handleCheckboxChangeItem2}
                  disabled={!hasItem2} // Disable if the user doesn't have the item
                />
                <CheckboxLabel htmlFor="item2">Tị Lôi Châu</CheckboxLabel>
              </CheckboxContainer>
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
