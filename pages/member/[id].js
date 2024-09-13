import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Layout from "../../components/Layout";
import Head from "next/head";

const Container = styled.div`
  display: flex;
  width: 100%;
  height: calc(200vh - 100px);
  flex-direction: row;
  justify-content: space-between;
  background-color: none;
  gap: 20px;
  padding: 0;
  align-items: start;
  box-sizing: border-box;
  @media (max-width: 749px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
`;

const LeftSection = styled.div`
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: 1px solid #93b6c8;
  box-sizing: border-box;
  @media (max-width: 749px) {
    width: 90vw;
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
  box-sizing: border-box;
  @media (max-width: 749px) {
    width: 90vw;
  }
`;

const CharacterContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  width: 100%;
`;

const CharacterImage = styled.img`
  max-width: 90%;
  height: auto;
  border-radius: 10px;
`;

const AvatarContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  height: 100px;
`;

const Frame = styled.img`
  position: absolute;
  width: 130px;
  z-index: 100;
  height: 130px;
`;

const Avatar = styled.img`
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid white;
  background-color: #f4f4f4;
  z-index: 2;
`;

const Username = styled.div`
  margin-top: 10px;
  font-size: 15px;
  color: #333;
  text-align: center;
`;

const NgoaiHieu = styled.div`
  font-size: 15px;
  font-weight: bold;
  color: #666;
  margin-top: 20px;
  text-align: center;
  line-height: 30px;
  border-top: 1px dashed #93b6c8;
`;

const TaiSanContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 1px dashed #93b6c8;
  padding: 0;
`;

const TaiSanImage = styled.img`
  height: 50px;
  padding: 0;
`;
const TaiSanValue = styled.div`
  color: #333;
  font-size: 15px;
`;

const ClanName = styled.div`
  margin-top: 10px;
  font-size: 16px;
  color: #666;
  text-align: center;
  font-size: 15px;
  border-top: 1px dashed #93b6c8;
  line-height: 30px;
`;

const ClanRole = styled.div`
  font-size: 15px;
  color: #4caf50;
  font-weight: bold;
  text-align: center;
  border-top: 1px dashed #93b6c8;
  line-height: 40px;
  border-bottom: 1px dashed #93b6c8;
`;

const Section = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  background-color: white;
  border: 1px solid #93b6c8;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const SectionTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  text-align: center;
`;

const ProgressContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ProgressBarLabel = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: bold;
  text-align: center;
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

const ProgressBar = styled.div`
  flex: 1;
  background-color: #e0e0e0;
  overflow: hidden;
  position: relative;
  height: 20px;
  z-index: 10;
  margin-top: 10px;
  border-radius: 5px;
`;

const Progress = styled.div`
  height: 100%;
  background-color: #4caf50;
  width: ${({ width }) => `${width}%`};
  transition: width 0.4s ease;
`;

const ItemsContainer = styled.div`
  margin-top: 10px;
  padding: 20px;
  max-height: 200px;
  overflow-y: auto;
  border-top: 1px dashed #93b6c8;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ItemLabel = styled.div`
  font-size: 14px;
  color: #333;
`;

const ItemValue = styled.div`
  background-color: #ffe58a;
  padding: 2px 6px;
  border-radius: 10px;
  color: white;
  font-size: 12px;
`;

const FormContainer = styled.div`
  text-align: center;
`;

const Input = styled.input`
  padding: 10px;
  width: 80%;
  border: 1px solid #93b6c8;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 10px 25px;
  background-color: #b3d7e8;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #93b6c8;
  }
`;
const Percent = styled.div`
  margin-top: 10px;
  z-index: 10;
  background-color: none;
  position: absolute;
  text-align: center;
  color: white;
`;
const GlowingText = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 0 5px rgba(255, 191, 0, 0.8), 0 0 10px rgba(255, 191, 0, 0.6);
`;

const MemberPage = ({ id }) => {
  const [user, setUser] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [items, setItems] = useState([]);
  const [canViewItems, setCanViewItems] = useState(true);
  const [moneyToSend, setMoneyToSend] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(`/api/user/member/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const userData = response.data;

          const levelResponse = await axios.post(
            `/api/user/dot-pha/level-info`,
            { level: userData.level },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUser(userData);
          setLevelData(levelResponse.data);

          if (userData.canView) {
            await fetchUserItems();
          } else {
            setCanViewItems(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    const fetchUserItems = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(`/api/user/ruong-do/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setItems(response.data || []);
        } catch (error) {
          console.error("Error fetching items:", error);
          setItems([]);
        }
      }
    };

    fetchUserData();
  }, [id]);

  const expProgress =
    user && levelData && levelData.exp > 0
      ? Math.min(Math.round((user.exp / levelData.exp) * 100), 100)
      : 0;

  const getClanRole = (roleId) => {
    const roles = {
      1: "Tạp Dịch",
      2: "Ngoại Môn Đệ Tử",
      3: "Nội Môn Đệ Tử",
      4: "Hộ Pháp",
      5: "Trưởng Lão",
      6: "Đại Trưởng Lão",
      7: "Chưởng Môn",
      9: "Ngân Quỹ",
    };
    return roles[roleId] || "Chưa vào bang";
  };

  const handleInputChange = (e) => {
    setMoneyToSend(e.target.value);
  };

  const handleSendMoney = async () => {
    if (!moneyToSend || isNaN(moneyToSend) || Number(moneyToSend) <= 0) {
      window.alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      window.alert("Please log in to send money.");
      return;
    }

    try {
      const response = await axios.post(
        `/api/user/member/sent-money`,
        { receiverId: id, amount: moneyToSend },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      window.alert(`Successfully sent ${moneyToSend} coins to ${user.username}.`);
      setMoneyToSend("");
    } catch (error) {
      console.error("Error sending money:", error);
      if (error.response && error.response.data.message) {
        window.alert(error.response.data.message);
      } else {
        window.alert("An error occurred while sending money.");
      }
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }
  const cap = Math.floor((user.level - 1) / 10) + 1;
  const getCapClass = (cap) => {
    return `cap-${cap}`;
  };
  return (
    <Layout>
      <Head>
        <title> {user.ngoai_hieu ? user.ngoai_hieu : user.username}</title>
      </Head>
      <Container>
        <LeftSection>
          <CharacterContainer>
            {user.id === 3 ? (
              <CharacterImage src="/Char/itachi.png" alt="Character" />
            ) : user.id === 5 ? (
              <CharacterImage src="/selee.png" alt="Character" />
            ) : (
              <CharacterImage src="/nv1.png" alt="Character" />
            )}
          </CharacterContainer>
        </LeftSection>

        <RightSection>
          <Section>
            <AvatarContainer>
              <Frame src="/frame.png" alt="Avatar Frame" />
              <Avatar
                src={user.image ? user.image : "/logo2.png"}
                alt="Default Avatar"
              />
            </AvatarContainer>
            {/* <Username>{user.username}</Username> */}
            <NgoaiHieu>
              {user.ngoai_hieu ? user.ngoai_hieu : user.username}
            </NgoaiHieu>
            <NgoaiHieu>
              {user.danh_hao ? user.danh_hao : "Chưa có danh hào"}
            </NgoaiHieu>
            <TaiSanContainer>
              <TaiSanImage src="/gold.png"></TaiSanImage>
              <TaiSanValue>{user.tai_san}</TaiSanValue>
            </TaiSanContainer>
            <ClanName>{user.clan_name || "Chưa vào bang"}</ClanName>
            <ClanRole>{getClanRole(user.clan_role)}</ClanRole>
          </Section>

          <Section>
            <SectionTitle>Tu luyện & Vật phẩm</SectionTitle>
            <ProgressContainer>
              {user.id === 3 ? (
                <GlowingText>Thiên Đạo</GlowingText>
              ) : (
                <ProgressBarLabel>
                  <span className={getCapClass(cap)}>{levelData.tu_vi}</span>
                </ProgressBarLabel>
              )}{" "}
              <ProgressBarContainer>
                <ProgressBar>
                  <Progress width={expProgress} />
                </ProgressBar>
                <Percent>{expProgress}%</Percent>
              </ProgressBarContainer>
            </ProgressContainer>
            <ItemsContainer>
              {canViewItems ? (
                items.length > 0 ? (
                  items
                    .filter((item) => item.so_luong > 0)
                    .map((item) => (
                      <ItemRow key={item.vat_pham_name}>
                        <ItemLabel
                          dangerouslySetInnerHTML={{
                            __html: item.vat_pham_name,
                          }}
                        />
                        <ItemValue>{item.so_luong}</ItemValue>
                      </ItemRow>
                    ))
                ) : (
                  <p>Rương đồ trống</p>
                )
              ) : (
                <p>Tu vi đạo hữu còn thấp không thể nhìn trộm túi đồ!</p>
              )}
            </ItemsContainer>
          </Section>
          <Section>
            <FormContainer>
              <SectionTitle>Tặng bạc</SectionTitle>
              <Input
                type="text"
                placeholder="Nhập số bạc mà bạn muốn tặng"
                value={moneyToSend}
                onChange={handleInputChange}
              />
              <Button onClick={handleSendMoney}>Gửi bạc</Button>
              {statusMessage && <p>{statusMessage}</p>}
            </FormContainer>
          </Section>
        </RightSection>
      </Container>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
}

export default MemberPage;
