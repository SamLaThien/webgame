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
  background-color: #eaf8f4;
  padding: 10px;
  border: 1px solid #93b6c8;
  border-radius: 8px;
  margin-top: 0;
`;

const Item = styled.p`
  margin: 0;
  padding: 0;
  border-bottom: 1px solid #93b6c8;

  &:last-child {
    border-bottom: none;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const Image = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
`;

const P = styled.p`
  margin-top: 0;
  margin-bottom: 10px;
`;

const RadioGroup = styled.div`
  margin-bottom: 15px;
`;

const RadioItem = styled.div`
  margin-bottom: 10px;
`;

const LuyenDanThat = () => {
  const [user, setUser] = useState(null);
  const [level, setLevelData] = useState(null);
  const [missingMeds, setMissingMeds] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState(null);
  const router = useRouter();

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

          const { data: missingMedsData } = await axios.post(
            "/api/user/luyen-dan/get-med",
            { userId: userData.id, level: userData.level },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (
            missingMedsData.missingMedicines &&
            missingMedsData.missingMedicines.length > 0
          ) {
            setMissingMeds(missingMedsData.missingMedicines);
          } else {
            setMissingMeds([]);
          }
        }
      } catch (error) {
        console.error("Error validating token or fetching data:", error);
      }
    };

    validateTokenAndFetchItems();
  }, [router]);
  const handleLearn = async () => {
    if (selectedMedId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "/api/user/luyen-dan/learn",
          { userId: user.id, medId: selectedMedId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert(response.data.message);
      } catch (error) {
        if (error.response && error.response.data) {
          alert(error.response.data.message);
        } else {
          alert("Đã xảy ra lỗi trong quá trình học.");
        }
      }
    } else {
      alert("Vui lòng chọn một đan phương để học.");
    }
  };
  

  return (
    <>
      <Container>
        <Section>
          <SectionTitle>
            <FormatListBulletedOutlinedIcon /> DANH SÁCH ĐAN PHƯƠNG
          </SectionTitle>
          <Content>
            {level ? (
              <>
                <P>
                  Mỗi lần học luyện 1 loại đan dược, bạn cần có{" "}
                  <strong>3 Hòa Thị Bích</strong>. Tu vi càng cao tỉ lệ học
                  thành công càng cao, nếu học không thành công bạn sẽ bị mất{" "}
                  <strong>3 Hòa Thị Bích</strong> nhưng không mất đan phương.
                </P>
                <P>
                  Tu vi hiện tại của bạn là <strong>{level.tu_vi}</strong>, bạn
                  chỉ có thể học được các đan phương sau:
                </P>
                <RadioGroup>
                  {missingMeds.length > 0 ? (
                    missingMeds.map((med) => (
                      <RadioItem key={med.id}>
                        <label>
                          <input
                            type="radio"
                            name="med"
                            value={med.id}
                            onChange={() => setSelectedMedId(med.id)}
                          />
                          {med.name}
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
          </SectionTitle>{" "}
          <Content>
            <DanPhuongList>
              <Item>
                Độ thành thục càng cao tỉ lệ thành đan và số lượng đan được nhận
                càng lớn
              </Item>
            </DanPhuongList>
            <ImageContainer>
              <Image src="/lodan.png" alt="Luyện đan" />
            </ImageContainer>
          </Content>
        </Section>
      </Container>
    </>
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
