import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Modal from "react-modal";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import axios from "axios";

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

const SectionTitle = styled.h2`
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

const AvatarContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const Avatar = styled.img`
  width: calc(9rem + 1vw);
  height: calc(9rem + 1vw);
  border: 3px solid #93b6c8;
  border-radius: 5%;
`;

const ChangeLabel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background: #93b6c8;
  color: white;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const UserInfoItem = styled.p`
  margin: 5px 0;
`;

const Section = styled.div`
  background: rgba(255, 255, 255);
  padding: 20px;
  border-radius: 0;
  width: 100%;
  border: 1px solid #93b6c8;
  box-sizing: border-box;
`;

const Input = styled.input`
  width: 80%;
  padding: 11px;
  margin: 10px 0;
  border: 1px solid #ddd;
  box-sizing: border-box;
  height: 100%;
  font-size: 16px;
  margin-right: 10px;
`;

const Input1 = styled.input`
  width: 100%;
  padding: 11px;
  margin: 10px 0;
  border: 1px solid #ddd;
  box-sizing: border-box;
  height: 100%;
  font-size: 16px;
  margin-right: 10px;
`;

const Button = styled.button`
  padding: 12px 20px;
  background-color: #b3d7e8;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background-color: #93b6c8;
  }
`;

const BottomLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  padding: 0;
  width: 100%;
  overflow: hidden;
`;

const SectionP = styled.div`
  margin-bottom: 10px;
`;

Modal.setAppElement("#__next");

//day file len thu muc -> luu lai chuoi -> get thì  decode base64

const HoSo = () => {
  const [user, setUser] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [changeNgoaiHieu, setChangeNgoaiHieu] = useState("");
  const [changeDanhHao, setChangeDanhHao] = useState("");
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [clanInfo, setClanInfo] = useState(null);
  const [giftCode, setGiftCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get("/api/user", {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.status === 200) {
            setUser(response.data);
            console.log("User data fetched successfully:", response.data);

            if (response.data.bang_hoi) {
              fetchClanInfo(response.data.bang_hoi, token);
            }
          } else {
            console.error("Failed to fetch user data:", response.statusText);
          }
        } else {
          console.error("No token found in localStorage, redirecting to login");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchClanInfo = async (clanId, token) => {
      try {
        const response = await axios.get(`/api/user/ho-so/get-clan-name?clanId=${clanId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          setClanInfo(response.data);
          console.log("Clan data fetched successfully:", response.data);
        } else {
          console.error("Failed to fetch clan data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching clan data:", error);
      }
    };

    fetchUserData();
  }, [router]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setModalIsOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSave = async () => {
    if (!user || !user.id) {
      alert("User ID is not available. Please try again.");
      console.log("User ID is undefined or null.");
      return;
    }
  
    if (user.tai_san < 1000) {
      alert("Không đủ bạc để đổi avatar");
      setModalIsOpen(false);
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your avatar.");
      return;
    }
  
    const formData = new FormData();
    formData.append("avatar", avatarFile);
  
    try {
      const response = await fetch(`/api/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        const updatedUser = {
          ...user,
          image: data.imagePath,
          tai_san: user.tai_san - 1000,
        };
        setUser(updatedUser);
        alert("Avatar updated successfully");
      } else {
        const result = await response.json();
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update avatar");
    }
  
    setModalIsOpen(false);
  };
  
  const handleConfirmSave = async () => {
    const cost = confirmType === "ngoai_hieu" ? 25000 : 0;
    if (user.tai_san < cost) {
      alert("Không đủ bạc để đổi ngoại hiệu");
      setConfirmModalIsOpen(false);
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your profile.");
      return;
    }
  
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          [confirmType]:
            confirmType === "ngoai_hieu" ? changeNgoaiHieu : changeDanhHao,
          tai_san: user.tai_san - cost,
        }),
      });
  
      if (response.ok) {
        const updatedUser = {
          ...user,
          [confirmType]:
            confirmType === "ngoai_hieu" ? changeNgoaiHieu : changeDanhHao,
          tai_san: user.tai_san - cost,
        };
        setUser(updatedUser);
        alert("Update successful");
      } else {
        const result = await response.json();
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update");
    }
  
    setConfirmModalIsOpen(false);
  };
  

  const handleNgoaiHieuChange = () => {
    setConfirmType("ngoai_hieu");
    setConfirmModalIsOpen(true);
  };

  const handleDanhHaoChange = () => {
    setConfirmType("danh_hao");
    setConfirmModalIsOpen(true);
  };

  const handleGiftCodeRedeem = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("You must be logged in to redeem a gift code.");
        return;
      }

      const response = await axios.post("/api/user/ho-so/redeem-gift-code", {
        giftCode: giftCode,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccessMessage("Gift code redeemed successfully!");
        setErrorMessage("");
      } else {
        setErrorMessage(response.data.message || "Failed to redeem gift code.");
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("An error occurred while redeeming the gift code.");
      setSuccessMessage("");
      console.error("Error redeeming gift code:", error);
    }
  };

  if (!user) return null;

  return (
    <>
      <SectionTitle>
        <AccountCircleOutlinedIcon />
        THÔNG TIN CÁ NHÂN
      </SectionTitle>
      <Container>
        <AvatarContainer>
          <Avatar src={user.image || "/logo2.png"} alt="User Avatar" />
          <ChangeLabel
            onClick={() => document.getElementById("avatarInput").click()}
          >
            Đổi
          </ChangeLabel>
          <input
            type="file"
            id="avatarInput"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </AvatarContainer>
        <UserInfo>
          <UserInfoItem>
            Ngoại hiệu: <b>{user.ngoai_hieu}</b>
          </UserInfoItem>
          <UserInfoItem>
            ID: <b>{user.id}</b>
          </UserInfoItem>
          <UserInfoItem>
            Danh hiệu: <b>{user.danh_hao || "Chưa có danh hiệu"}</b>
          </UserInfoItem>
          <UserInfoItem>
            Bang hội: <b>{clanInfo ? clanInfo.name : "Chưa có bang hội"}</b>
          </UserInfoItem>
          <UserInfoItem>
            Tài sản: <b>{user.tai_san || 0}</b> bạc
          </UserInfoItem>
        </UserInfo>
      </Container>
      <BottomLayout>
        <Card>
          <SectionTitle>
            <LocalOfferOutlinedIcon />
            ĐỔI NGOẠI HIỆU
          </SectionTitle>
          <Section>
            <SectionP>Ngoại hiệu hiện tại: {user.ngoai_hieu}</SectionP>
            <SectionP>
              Hãy nhập một Ngoại Hiệu bên dưới để đổi, nếu bạn chưa nghĩ ra
              Ngoại Hiệu nào mời bạn vào vòng quay may mắn để thử vận may
            </SectionP>
            <Input
              type="text"
              placeholder="Nhập ngoại hiệu mà bạn muốn đổi"
              onChange={(e) => setChangeNgoaiHieu(e.target.value)}
            />
            <Button onClick={handleNgoaiHieuChange}>Đổi</Button>
          </Section>
        </Card>
        <Card>
          <SectionTitle>
            <PersonOutlineOutlinedIcon /> ĐỔI DANH HÀO
          </SectionTitle>
          <Section>
            <SectionP>
              Danh hiệu hiện tại: {user.danh_hao || "Chưa có danh hiệu"}
            </SectionP>
            <SectionP>
              Chọn một Danh hào bên dưới để đổi, nếu chưa có danh hào nào mời
              bạn vào vòng quay may mắn để thử vận may
            </SectionP>
            <Input
              type="text"
              placeholder="Nhập danh hiệu mà bạn muốn đổi"
              onChange={(e) => setChangeDanhHao(e.target.value)}
            />
            <Button onClick={handleDanhHaoChange}>Đổi</Button>
          </Section>
        </Card>
        <Card>
          <SectionTitle>
            <LocalFireDepartmentOutlinedIcon />
            MUA DANH HÀO
          </SectionTitle>

          <Section>
            <SectionP>
              Chọn theo mẫu có sẳn hoặc nhập theo ý muốn của bạn
            </SectionP>
            <div>
              <label>
                <input
                  type="radio"
                  name="danhHaoOption"
                  value="Mẫu sẵn"
                  defaultChecked
                />{" "}
                Mẫu sẵn
              </label>
              <label>
                <input type="radio" name="danhHaoOption" value="Tự nhập" /> Tự
                nhập
              </label>
            </div>
            <Input1 type="text" placeholder="Danh hào" />
            <Button>Mua</Button>
            <Button>Đổi màu danh hào</Button>
          </Section>
        </Card>
        <Card>
          <SectionTitle>
            <LocalFireDepartmentOutlinedIcon />
            GIFT CODE
          </SectionTitle>
          <Section>
            <Input
              type="text"
              placeholder="Nhập giftcode"
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
            />
            <Button onClick={handleGiftCodeRedeem}>Nhận quà</Button>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {successMessage && (
              <p style={{ color: "green" }}>{successMessage}</p>
            )}
          </Section>
        </Card>
      </BottomLayout>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Change Avatar"
      >
        <h2>Change Avatar</h2>
        <img
          src={avatarPreview}
          alt="Avatar Preview"
          style={{ width: "100px", height: "100px" }}
        />
        <div>
          <Button onClick={handleAvatarSave}>Đổi</Button>
          <Button onClick={() => setModalIsOpen(false)}>Cancel</Button>
        </div>
      </Modal>
      <Modal
        isOpen={confirmModalIsOpen}
        onRequestClose={() => setConfirmModalIsOpen(false)}
        contentLabel="Confirm Change"
      >
        <h2>Confirm Change</h2>
        {confirmType === "ngoai_hieu" ? (
          <p>Bạn có chắc chắn muốn đổi ngoại hiệu?</p>
        ) : (
          <p>Bạn có chắc chắn muốn đổi danh hiệu?</p>
        )}
        <div>
          <Button onClick={handleConfirmSave}>Đổi</Button>
          <Button onClick={() => setConfirmModalIsOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  );
};

export default HoSo;
