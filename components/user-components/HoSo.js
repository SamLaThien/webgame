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
  border-radius: 50%;
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
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  background-color: #B3D7E8;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background-color: #93B6C8;
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

const HoSo = () => {
  const [user, setUser] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [changeNgoaiHieu, setChangeNgoaiHieu] = useState("");
  const [changeDanhHao, setChangeDanhHao] = useState("");
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userId = JSON.parse(storedUser).id;
          console.log("Retrieved userId from localStorage:", userId);
          if (!userId) {
            console.error("User ID is not found in localStorage");
            router.push("/login");
            return;
          }
          const response = await axios.post('/api/user', { userId });
          if (response.status === 200) {
            setUser(response.data);
            console.log("User data fetched successfully:", response.data);
          } else {
            console.error("Failed to fetch user data:", response.statusText);
          }
        } else {
          console.error("No user found in localStorage, redirecting to login");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [router]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarFile(file);
        setAvatarPreview(reader.result);
        setModalIsOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSave = async () => {
    if (user.tai_san < 1000) {
      alert("Không đủ bạc để đổi avatar");
      setModalIsOpen(false);
      return;
    }
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          image: avatarPreview,
          tai_san: user.tai_san - 1000,
        }),
      });

      if (response.ok) {
        const updatedUser = {
          ...user,
          image: avatarPreview,
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
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          [confirmType]: confirmType === "ngoai_hieu" ? changeNgoaiHieu : changeDanhHao,
          tai_san: user.tai_san - cost,
        }),
      });

      if (response.ok) {
        const updatedUser = {
          ...user,
          [confirmType]: confirmType === "ngoai_hieu" ? changeNgoaiHieu : changeDanhHao,
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

  if (!user) return null;

  return (
    <>
      <SectionTitle>
        <AccountCircleOutlinedIcon />
        THÔNG TIN CÁ NHÂN
      </SectionTitle>
      <Container>
        <AvatarContainer>
          <Avatar
            src={user.image || `/public/image/logo (2).png`}
            alt="User Avatar"
          />
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
            Bang hội: <b>{user.bang_hoi || "Chưa có bang hội"}</b>
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
          <p>
            Bạn có chắc chắn muốn đổi ngoại hiệu?
          </p>
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
