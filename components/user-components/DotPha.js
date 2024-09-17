import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import BoltIcon from "@mui/icons-material/Bolt";
import { Bolt, Error } from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";
import {
  levelItemChances,
  consistentItemChances,
} from "@/utils/levelItemChances";
import { useRouter } from "next/router";

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

const GlowingText = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: white !important;
  margin-bottom: 10px;
  text-shadow: 0 0 5px rgba(255, 191, 0, 0.8), 0 0 10px rgba(255, 191, 0, 0.6) !important;
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
  overflow: hidden;
  margin-bottom: 20px;
`;

const Progress = styled.div`
  width: ${({ width }) => width}%;
  background: #4caf50;
  height: 20px;
`;

const Info = styled.div`
  margin: 10px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .cap-1 {
      color: #9820D0;
  }
  .cap-2 {
      color: #4B0082;
  }
  .cap-3 {
      color: #3755D6;
  }
  .cap-4 {
      color: #008A00;
  }
  .cap-5 {
      color: #E2CD19;
  }
  .cap-6 {
      color: #FFA500;
  }
  .cap-7 {
      color: #C12A1C;
  }
  .cap-8 {
      color: #61CBF3;
  }
  .cap-9 {
      color: #DAA520;
  }
  .cap-10 { /* Nhân Tiên */
      text-shadow:none;
      background: #E0B700 -webkit-gradient(linear, left top, right top,
  from(#E0B700), to(#E0B700), color-stop(0.5, #ffffff)) 0 0 no-repeat;
      color: rgba(255, 255, 255, 0.1);
  
      font-weight: bold;
      position: relative;
   
      -webkit-animation: shine 2s infinite;
      -webkit-background-clip: text;
      -webkit-background-size: 30px;
  }
  .cap-11 { /* Địa Tiên */
      text-shadow:none;
      background: #CD853F -webkit-gradient(linear, left top, right top,
  from(#CD853F), to(#CD853F), color-stop(0.5, #ffffff)) 0 0 no-repeat;
      color: rgba(255, 255, 255, 0.1);
  
      font-weight: bold;
      position: relative;
   
      -webkit-animation: shine 2s infinite;
      -webkit-background-clip: text;
      -webkit-background-size: 30px;
  }
  .cap-12 { /* Thiên Tiên */
      text-shadow:none;
      background: rgb(37 169 158) -webkit-gradient(linear, left top, right top, from(#4a17af), to(#ba603f), color-stop(0.5, #ffffff)) 0 0 no-repeat;
      color: rgba(255, 255, 255, 0.1);
      font-weight: bold;
      position: relative;
   
      -webkit-animation: shine 2s infinite;
      -webkit-background-clip: text;
      -webkit-background-size: 30px;
  }
  .cap-13 { /* Thượng Tiên */
      text-shadow:none;
      background: #CD853F -webkit-gradient(linear, left top, right top,
  from(#CD853F), to(#CD853F), color-stop(0.5, #ffffff)) 0 0 no-repeat;
      color: rgba(255, 255, 255, 0.1);
  
      font-weight: bold;
      position: relative;
   
      -webkit-animation: shine 2s infinite;
      -webkit-background-clip: text;
      -webkit-background-size: 30px;
  }
  .cap-14 { /* Đại La Tiên */
      text-shadow:none;
      background: #CD853F -webkit-gradient(linear, left top, right top,
  from(#CD853F), to(#CD853F), color-stop(0.5, #ffffff)) 0 0 no-repeat;
      color: rgba(255, 255, 255, 0.1);
  
      font-weight: bold;
      position: relative;
   
      -webkit-animation: shine 2s infinite;
      -webkit-background-clip: text;
      -webkit-background-size: 30px;
  }
  span {
    color: #00000;
    font-weight: bold;
  }
    @-webkit-keyframes shine {
  0% {
    background-position: -100px;
  }
  100% {
    background-position: 100px;
  }
}
`;

const MandatoryItems = styled.div`
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
  display: ${({ hidden }) => (hidden ? 'none' : 'block')}; // Conditional display
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

const Exp = styled.div``;
const ExpPercent = styled.div``;

const DotPha = () => {
  const [user, setUser] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});
  const router = useRouter();
  const [validItems, setValidItems] = useState([]);
  const [buttonHidden, setButtonHidden] = useState(false);

  useEffect(() => {
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

        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const { data: userData } = await axios.get(
            `/api/user/clan/user-info?userId=${storedUser.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUser(userData);

          const { data: fetchedLevelData } = await axios.post(
            `/api/user/dot-pha/level-info`,
            { level: userData.level },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setLevelData(fetchedLevelData);

          fetchValidItems(userData, token, fetchedLevelData.level);
        }
      } catch (error) {
        console.error("Error validating token or fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    validateTokenAndFetchItems();
  }, [router]);

  const fetchValidItems = async (userData, token, level) => {
    try {
      let itemIds = ["83", "44", "45", "46", "47", "48", "49", "50", "51"]

      const { data: validItemsData } = await axios.get(
        `/api/user/dot-pha/check-used-items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            userId: userData.id,
            usedItemIds: itemIds.join(","),
          },
        }
      );
      setValidItems(validItemsData);
    } catch (error) {
      console.error("Error fetching valid items:", error);
    }
  };

  const handleCheckboxChange = (itemId) => {
    setCheckedItems((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  const logUserActivity = async (actionType, actionDetails) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "/api/user/log/dot-pha-log",
        { actionType, actionDetails },
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

  const logClanActivity = async (actionType, actionDetails) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "/api/user/log/dot-pha-clan-log",
        { actionType, actionDetails },
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

  const handleLevelUp = async () => {
    if (user && levelData && user.exp >= levelData.exp) {

      setButtonHidden(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const requiredItemIds = levelData.vatpham_bat_buoc_id
          ? levelData.vatpham_bat_buoc_id.split(",")
          : [];

        //if (requiredItemIds.length > 0) {
        //  const { data: requiredItemsData } = await axios.get(
        //    `/api/user/dot-pha/check-required-item`,
        //    {
        //      headers: {
        //        Authorization: `Bearer ${token}`,
        //      },
        //      params: {
        //        userId: user.id,
        //        itemIds: requiredItemIds.join(","),
        //      },
        //    }
        //  );
        //
        //  if (!requiredItemsData.hasRequiredItems) {
        //    alert("Bạn không có đủ vật phẩm bắt buộc để Đột Phá.");
        //    return;
        //  }
        //}
        const selectedItems = Object.keys(checkedItems).filter(
          (itemId) => checkedItems[itemId]
        );
        // dp
        const levelUpResponse = await axios.post(
          "/api/user/dot-pha/check-updata",
          {
            usedItemIds: selectedItems.join(","),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert(levelUpResponse.data.message);
        let levels;
        
        if (cap == 0) {
          levels = 1
        } else levels = Math.floor((user.level) / 10) + 1;
        console.log(levels)
        const index = getCapClass(levels);
        if (levelUpResponse.data.message == 'Đột phá thành công') {
          try {
            await fetch("/api/user/nhiem-vu/tra-nhiem-vu/dot-pha", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ userId: user.id }),
            });
          } catch (error) {
            console.error("Error calling nhiem-vu API:", error);
          }
          
          await logUserActivity(
            "Dot Pha Success",
            `đã đột phá thành công, tấn thăng <span class="${index}"> ${levelUpResponse.data.nextLevel}</span>, nhận được ${levelUpResponse.data.newTaiSan} bạc và ${levelUpResponse.data.item.Name} (Còn ${levelUpResponse.data.so_luong})`
          );
          await logClanActivity(
            "Dot Pha Success",
            `đã đột phá thành công, tấn thăng <span class="${index}"> ${levelUpResponse.data.nextLevel}</span>, nhận được phần quà là ${levelUpResponse.data.item.Name} và ${levelUpResponse.data.newTaiSan} bạc.`
          );
        } else if (levelUpResponse.data.message == 'Rất tiếc, đạo hữu chưa đủ may mắn để có thể tiến cấp, vui lòng tu luyện thêm!') {
          await logUserActivity(
            "Dot Pha Fail",
            `chưa đủ cơ duyên để đột phá <span class="${index}"> ${levelUpResponse.data.nextLevel}</span> (${levelUpResponse.data.successChance} %), mất ${levelUpResponse.data.expLoss} kinh nghiệm`
          );
          const newExp = Math.max(0, user.exp - levelUpResponse.data.expLoss);
          setUser((prevUser) => ({
            ...prevUser,
            exp: newExp,
          }));
        }
      } catch (error) {
        alert(
          error.response?.data?.message || "Sorry, unexpected error. Please try again later."
        );
      } finally {
        window.location.reload();
      }
    }
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (!user || !levelData) {
    return <Container>Error loading data.</Container>;
  }

  const expProgress1 = (Math.min((user.exp / levelData.exp) * 100, 100));
  const formattedExpProgress = expProgress1 === 100 ? '100' :
    expProgress1 === 0 ? '0' :
      expProgress1.toFixed(2);
  const cap = Math.floor((user.level - 1) / 10) + 1;
  const expProgress = (user.exp / levelData.exp) * 100;
  const canLevelUp = user.exp >= levelData.exp;
  const levelsToCheck = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  const isDoKiep = levelsToCheck.includes(user.level);
  const getCapClass = (cap) => {
    return `cap-${cap}`;
  };

  const findLevelByItemId = (itemId) => {
    for (const levelRangeKey in levelItemChances) {
      if (levelItemChances[levelRangeKey].includes(itemId)) {
        return levelRangeKey;
      }
    }
    return null; // Item ID not found in any level
  };

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
                Cảnh giới hiện tại:{" "}
                {user.id === 3 ? (
                  <GlowingText>Thiên Đạo</GlowingText>
                ) : (
                  <span className={getCapClass(cap)}>{levelData.tu_vi}</span>
                )}
              </Info>

              <Info>Tiến độ tu luyện</Info>
              <Info>
                <Exp>
                  {Math.round(user.exp)}/{levelData.exp}
                </Exp>
                <ExpPercent>{formattedExpProgress}%</ExpPercent>
              </Info>
              <ProgressBar>
                <Progress width={expProgress} />
              </ProgressBar>

              <MandatoryItems>
                {levelData.vatpham_bat_buoc ? (
                  <>
                    Vật phẩm bắt buộc:{" "}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: levelData.vatpham_bat_buoc,
                      }}
                    />
                  </>
                ) : (
                  "Không cần vật phẩm bắt buộc"
                )}
              </MandatoryItems>

              <Info>Vật phẩm phụ trợ tăng tỉ lệ thành công:</Info>

              {[
                ...new Set(
                  validItems
                    .filter((item) => item.so_luong > 0)
                    .map((item) => item.vat_pham_id)
                ),
              ].map((uniqueId) => {
                const item = validItems.find((v) => v.vat_pham_id === uniqueId);

                return (
                  <CheckboxContainer key={item.vat_pham_id}>
                    <input
                      type="checkbox"
                      id={`item-${item.vat_pham_id}`}
                      checked={!!checkedItems[item.vat_pham_id]}
                      onChange={() => handleCheckboxChange(item.vat_pham_id)}
                    />
                    <CheckboxLabel htmlFor={`item-${item.vat_pham_id}`}>
                      {getItemNameById(item.vat_pham_id)} (
                      {(() => {

                        const levelRangeKey = findLevelByItemId(item.vat_pham_id);
                        const levelChance = levelRangeKey !== null ? levelRangeKey : "Not Found";
                        let displayValue, consistentChance;
                        if (levelChance !== null) {
                          let reductionPercentage = (Math.max(0, cap - levelChance) / 10) * 100;
                          if (levelChance == 0) {
                            consistentChance = consistentItemChances[item.vat_pham_id];
                          } else {
                            consistentChance = (consistentItemChances[item.vat_pham_id] * ((100 - reductionPercentage) / 100));
                          }
                          consistentChance = Math.round(consistentChance);

                          displayValue = consistentChance !== undefined
                            ? `${consistentChance}%`
                            : "0%";
                        }
                        return displayValue;
                      })()})
                    </CheckboxLabel>
                  </CheckboxContainer>
                );
              })}

              <DotPhaButton onClick={handleLevelUp} disabled={!canLevelUp}>
                {isDoKiep ? "Độ kiếp" : "Đột phá"}
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
    83: "Huyết Khí Đan",
    44: "Đê Giai Thuẫn",
    45: "Tị Lôi Châu",
    46: "Thanh Tâm Đan",
    47: "Hộ Linh Trận",
    48: "Tán Lôi Trận",
    49: "Sa Ngọc Châu",
    80: "Hoàng Kim Lệnh",
    51: "Hoả Ngọc Châu",
    50: "Thải Ngọc Châu",
  };
  return itemNames[itemId] || `Item ${itemId}`;
};
