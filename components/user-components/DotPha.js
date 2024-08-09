import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 100%;
`;

const MainContent = styled.div`
  flex: 1;
  margin-right: 20px;
`;

const InfoContent = styled.div`
  flex: 0.4;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const Title = styled.h2`
  margin-bottom: 20px;
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
  background: #f44336;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  width: 100%;
`;

const Notice = styled.div`
  margin-top: 20px;
  font-size: 12px;
  color: #555;
`;

const DotPha = () => {
  const [user, setUser] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0); 

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

    fetchUserAndLevel();
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

        if (seconds !== 0 && seconds % 10 === 0) {
          console.log("10 seconds reached. Preparing to update EXP...");
          updateExp();
        }
      }, 1000); 

      return () => clearInterval(interval); 
    }
  }, [user, seconds]);

  const updateExp = async () => {
    try {
      console.log("Calling API to update EXP...");
      const response = await axios.post("/api/user/dot-pha/update", {
        userId: user.id,
      });
      console.log("API response:", response.data);
      setUser((prevUser) => ({ ...prevUser, exp: prevUser.exp + 1 }));
    } catch (error) {
      console.error("Error updating exp:", error);
    }
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (!user || !levelData) {
    return <Container>Error loading data.</Container>;
  }

  const expProgress = (user.exp / levelData.exp) * 100;

  return (
    <>
      <Container>
      <Title>ĐỘT PHÁ & ĐỘ KIẾP</Title>
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
          <Info>0%</Info>
          <MandatoryItems>
            Vật phẩm bắt buộc: {levelData.vatpham_bat_buoc}
          </MandatoryItems>
          <Info>Vật phẩm phụ trợ tăng tỉ lệ thành công:</Info>
          <ul>
            <li>Đề Giai Thuấn (5%)</li>
            <li>Tị Lôi Châu (10%)</li>
          </ul>
          <DotPhaButton onClick={() => alert("Đột phá button clicked!")}>
            Đột phá
          </DotPhaButton>
          <Notice>
            - Các vật phẩm dùng để đột phá cảnh giới có thể kiếm tại vòng quay
            may mắn hoặc mua tại Hắc Thị
            <br />
            - Nếu đẳng cấp vật phẩm phụ trợ đạo hữu sử dụng thấp hơn tu vi hiện
            tại thì tỉ lệ tăng kinh nghiệm sẽ bị giảm xuống, trừ công pháp Vô
            Cấp
            <br />- Nếu đột phá thất bại, đạo hữu sẽ bị mất{" "}
            {levelData.dot_pha_that_bai_mat_exp_percent}% kinh nghiệm
          </Notice>
        </MainContent>
      </Container>
      <Container>
        <InfoContent>
          <Title>CẦN BIẾT</Title>
          <p>
            Đạo hữu có thể tu luyện tăng kinh nghiệm bằng cách đọc truyện, bình
            luận bằng tài khoản truyencv, chơi game, tặng đấu, ném đá hoặc cắn
            thuốc.
          </p>
          <p>
            Lưu ý không được spam comment để cày kinh nghiệm, spam sẽ bị ban
            nick từ 1 tới 7 ngày tùy mức độ.
          </p>
          <p>
            Đạo hữu đang nhận kinh nghiệm nhanh hơn 0% so với người thường khi
            đọc truyện hoặc treo tài khoản tại Nghi Sự Đường.
          </p>
          <p>
            Nếu đẳng cấp công pháp đạo hữu đang sử dụng thấp hơn tu vi hiện tại
            thì tốc độ tăng kinh nghiệm sẽ bị giảm xuống, trừ công pháp Vô Cấp.
          </p>
          <p>
            Đọc truyện trên Động Thiên Phúc Địa App dùng app để đọc truyện sẽ
            được kinh nghiệm nhanh hơn tu luyện trên web.
          </p>
        </InfoContent>
      </Container>
    </>
  );
};

export default DotPha;
