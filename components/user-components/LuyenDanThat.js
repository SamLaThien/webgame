import React, { useEffect, useState } from "react";
import styled from "styled-components";
import GroupWorkOutlinedIcon from "@mui/icons-material/GroupWorkOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import { useRouter } from "next/router";
import axios from "axios";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  @media (max-width: 749px) {
    flex-direction: column;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  @media (max-width: 749px) {
    flex-direction: column;
  }
  background-color: none;
`;

const Section = styled.div`
  flex: 1;
  background-color: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 0;
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

const Content = styled.div`
  border: 1px solid #93b6c8;
  padding: 15px;
  background-color: white;
`;

const LearnButton = styled.button`
  background-color: #b3d7e8;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;

  &:hover {
    background-color: #93b6c8;
  }
`;

const DanPhuongList = styled.div`
  margin: 0;
  padding: 0;
  border-bottom: 1px dashed #93b6c8;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 10px;
  &:last-child {
    border-bottom: none;
  }
`;

const Error = styled.div`
  color: red;
`;

const Item = styled.p`
  background-color: #eaf8f4;
  padding: 10px;
  border: 1px solid #93b6c8;
  border-radius: 8px;
  margin-top: 0;
`;

const ClickableImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  cursor: pointer;
`;

const ClickableImage = styled.img`
  max-width: 50%;
  height: auto;
  border-radius: 8px;
  &:hover {
    opacity: 0.8;
  }
`;

const P = styled.p`
  margin-top: 0;
  margin-bottom: 10px;
`;

const P1 = styled.p`
  font-size: 15px;
  margin-top: 0;
  display: inline;
`;

const P2 = styled.p`
  font-size: 14px;
  margin-bottom: 5px;
  margin-top: 0;
  font-weight: 300;
  font-style: italic;
  margin-top: 5px;
`;

const P3 = styled.p`
  font-size: 14px;
  margin-bottom: 5px;
  margin-top: 0;
  font-weight: 300;
`;

const P4 = styled.span`
  margin: 0;
  color: rgb(202, 138, 4);
`;

const RadioGroup = styled.div`
  margin-bottom: 15px;
`;

const RadioItem = styled.div`
  margin-bottom: 10px;
`;

const RadioInput = styled.input.attrs({ type: "radio" })`
  margin-right: 10px !important;
  margin: 0;
  cursor: pointer;

  &:checked {
    background-color: #93b6c8;
  }
`;

const ProgressBarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  position: relative;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 30px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
`;

const Progress = styled.div`
  height: 100%;
  background-color: #76c7c0;
  width: ${({ progress }) => progress}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  top: 0;
  left: 0;
  font-size: 18px;
  color: #fff;
  line-height: 30px;
`;

const fetchUserData = async (token, router) => {
  try {
    const { data } = await axios.get("/api/user/validate-token", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!data.isValid) {
      router.push("/login");
      return null;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      const { data: userData } = await axios.get(
        `/api/user/clan/user-info?userId=${storedUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data: levelData } = await axios.post(
        `/api/user/dot-pha/level-info`,
        { level: userData.level },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data: missingMedsData } = await axios.post(
        "/api/user/luyen-dan/get-med",
        { userId: userData.id, level: userData.level },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data: userMedsData } = await axios.post(
        "/api/user/luyen-dan/get-user-med",
        { userId: userData.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data: makingMedData } = await axios.post(
        "/api/user/luyen-dan/check-making-med",
        { userId: userData.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { userData, levelData, missingMedsData, userMedsData, makingMedData };
    }
  } catch (error) {
    console.error("Error validating token or fetching data:", error);
  }
};

const LuyenDanThat = () => {
  const [user, setUser] = useState(null);
  const [level, setLevelData] = useState(null);
  const [missingMeds, setMissingMeds] = useState([]);
  const [userMedicines, setUserMedicines] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState(null);
  const [selectedMakeMedId, setSelectedMakeMedId] = useState(null);
  const [makingMedData, setMakingMedData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const data = await fetchUserData(token, router);
      if (data) {
        setUser(data.userData);
        setLevelData(data.levelData);
        setMissingMeds(data.missingMedsData.missingMedicines || []);
        setUserMedicines(data.userMedsData.medicines);
        setMakingMedData(data.makingMedData || null);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [router]);

  useEffect(() => {
    if (makingMedData?.ongoingProcess) {
      const startTime = new Date(makingMedData.ongoingProcess.created_at).getTime();
      const endTime = new Date(makingMedData.ongoingProcess.end_at).getTime();

      const calculateProgress = () => {
        const now = new Date().getTime();
        const progress = ((now - startTime) / (endTime - startTime)) * 100;
        setProgress(Math.min(progress, 100));
      };

      calculateProgress();
      const progressInterval = setInterval(calculateProgress, 1000);

      return () => clearInterval(progressInterval);
    }
  }, [makingMedData]);

  const handleLearn = async () => {
    if (selectedMedId) {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.post(
          "/api/user/luyen-dan/learn",
          { userId: user.id, medId: selectedMedId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(data.message);
      } catch (error) {
        alert(error.response?.data?.message || "Đã xảy ra lỗi trong quá trình học.");
      }
    } else {
      alert("Vui lòng chọn một đan phương để học.");
    }
  };

  const handleStartMedicineMaking = async () => {
    if (selectedMakeMedId) {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.post(
          "/api/user/luyen-dan/start-medicine-making",
          { userId: user.id, medId: selectedMakeMedId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(data.message);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Đã xảy ra lỗi trong quá trình chế tạo.");
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } else {
      alert("Vui lòng chọn một đan phương để chế tạo.");
    }
  };

  return (
    <Container>
      <Section>
        <SectionTitle>
          <FormatListBulletedOutlinedIcon /> DANH SÁCH ĐAN PHƯƠNG
        </SectionTitle>
        <Content>
          {level ? (
            <>
              <P>
                Mỗi lần học luyện 1 loại đan dược, bạn cần có <strong>3 Hòa Thị Bích</strong>. Tu vi càng cao tỉ lệ học
                thành công càng cao, nếu học không thành công bạn sẽ bị mất <strong>3 Hòa Thị Bích</strong> nhưng không
                mất đan phương.
              </P>
              <P>
                Tu vi hiện tại của bạn là <strong>{level.tu_vi}</strong>, bạn chỉ có thể học được các đan phương sau:
              </P>
              <RadioGroup>
                {missingMeds.length > 0 ? (
                  missingMeds.map((med) => (
                    <RadioItem key={med.id}>
                      <label>
                        <RadioInput
                          type="radio"
                          name="med"
                          value={med.id}
                          onChange={() => setSelectedMedId(med.id)}
                        />
                        {med.name} Phương
                      </label>
                    </RadioItem>
                  ))
                ) : (
                  <P>Không có đan phương nào để học.</P>
                )}
              </RadioGroup>
              <LearnButton onClick={handleLearn}>Học</LearnButton>
            </>
          ) : (
            <P>Đang tải dữ liệu...</P>
          )}
        </Content>
      </Section>

      <Section>
        <SectionTitle>
          <GroupWorkOutlinedIcon /> LUYỆN ĐAN
        </SectionTitle>
        <Content>
          <Item>
            {user && user.lds_level > 0
              ? `Luyện Đan Sư Cấp ${user.lds_level}`
              : `Luyện Đan Sư Học Đồ`}
          </Item>
          <Item>Độ thành thục càng cao tỉ lệ thành đan và số lượng đan được nhận càng lớn</Item>

          {makingMedData?.ongoingProcess ? (
            <ProgressBarContainer>
              <ProgressBar>
                <Progress progress={progress} />
                <ProgressText>{Math.round(progress)}%</ProgressText>
              </ProgressBar>
            </ProgressBarContainer>
          ) : (
            <DanPhuongList>
              {userMedicines.map((medicine) => (
                <div key={medicine.med_id}>
                  <RadioInput
                    type="radio"
                    name="make-med"
                    value={medicine.med_id}
                    onChange={() => setSelectedMakeMedId(medicine.med_id)}
                  />
                  <P1>
                    <strong>{medicine.name}</strong>{" "}
                    <P4>(Độ thành thục: {medicine.skill}%)</P4>
                  </P1>
                  <P2>
                    <strong>Đan dược này cần:&nbsp;</strong>
                    {medicine.itemsDetails.map((item, index) => (
                      <span key={item.itemId}>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: ` ${item.quantity} ${item.name} `,
                          }}
                        />
                        {index < medicine.itemsDetails.length - 1 && ", "}
                      </span>
                    ))}
                  </P2>
                  <P3>Thời gian luyện: {parseInt(medicine.create_time)} giờ</P3>
                </div>
              ))}

              {errorMessage && <Error dangerouslySetInnerHTML={{ __html: errorMessage }} />}
              <ClickableImageContainer onClick={handleStartMedicineMaking}>
                <ClickableImage src="/lodan.png" alt="Luyện đan" />
              </ClickableImageContainer>
            </DanPhuongList>
          )}
        </Content>
      </Section>
    </Container>
  );
};

export default LuyenDanThat;

const Level = {
  35: 3,
  45: 4,
  55: 5,
  65: 6,
  75: 7,
  85: 8,
  95: 9,
  105: 10,
  115: 11,
};
