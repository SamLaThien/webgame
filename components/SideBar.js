import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";

const SidebarContainer = styled.div`
  width: 250px;
  display: flex;
  flex-direction: column;
  @media (max-width: 749px) {
    width: 95vw !important;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 20px;
  border: 1px solid #93b6c8;
  @media (max-width: 749px) {
    width: 95vw !important;
  }
`;

const SectionTitle = styled.div`
  cursor: pointer;
  font-weight: bold;
  padding: 12px;
  background-color: #b3d7e8;
  color: white;
  border-bottom: 1px solid #93b6c8;
  @media (max-width: 749px) {
    width: 90vw !important;
  }
`;

const Button = styled.a`
  width: 100%;
  padding: 10px;
  background-color: white;
  color: black;
  text-decoration: none;
  font-size: 16px;
  display: block;
  box-sizing: border-box;
  @media (max-width: 749px) {
    width: 95vw !important;
  }

  &:hover {
    background-color: #93b6c8;
  }

  &.active {
    background-color: #b3d7e8;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const Sidebar = ({ isLoggedIn, user }) => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("");
  const [openSections, setOpenSections] = useState({
    taikhoan: true,
    taisan: true,
    tulyen: true,
    bangphai: true,
  });
  useEffect(() => {
    setActiveSection(router.pathname);
  }, [router.pathname]);

  const toggleSection = (section) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };
  // console.log("This is fetch use from SIDEBAR" + JSON.stringify(user));

  return (
    <SidebarContainer>
      <SidebarSection>
        <SectionTitle onClick={() => toggleSection("taikhoan")}>
          Tài khoản
        </SectionTitle>
        {openSections.taikhoan && (
          <>
            <StyledLink href="/ho-so" passHref>
              <Button className={activeSection === "/ho-so" ? "active" : ""}>
                Hồ sơ
              </Button>
            </StyledLink>
            <StyledLink href="/tin-nhan" passHref>
              <Button className={activeSection === "/tin-nhan" ? "active" : ""}>
                Tin nhắn
              </Button>
            </StyledLink>
            <StyledLink href="/doi-mat-khau" passHref>
              <Button
                className={activeSection === "/doi-mat-khau" ? "active" : ""}
              >
                Đổi mật khẩu
              </Button>
            </StyledLink>
          </>
        )}
      </SidebarSection>

      <SidebarSection>
        <SectionTitle onClick={() => toggleSection("taisan")}>
          Tài sản
        </SectionTitle>
        {openSections.taisan && (
          <StyledLink href="/ruong-chua-do" passHref>
            <Button
              className={activeSection === "/ruong-chua-do" ? "active" : ""}
            >
              Rương chứa đồ
            </Button>
          </StyledLink>
        )}
      </SidebarSection>

      <SidebarSection>
        <SectionTitle onClick={() => toggleSection("tulyen")}>
          Tu luyện
        </SectionTitle>
        {openSections.tulyen && (
          <>
            <StyledLink href="/dot-pha" passHref>
              <Button className={activeSection === "/dot-pha" ? "active" : ""}>
                Đột phá
              </Button>
            </StyledLink>
            <StyledLink href="/quy-thi" passHref>
              <Button className={activeSection === "/quy-thi" ? "active" : ""}>
                Hắc Điếm
              </Button>
            </StyledLink>
            <StyledLink href="/luyen-dan-that" passHref>
              <Button
                className={activeSection === "/luyen-dan-that" ? "active" : ""}
              >
                Luyện đan thất
              </Button>
            </StyledLink>
            <StyledLink href="/luyen-khi-that" passHref>
              <Button
                className={activeSection === "/luyen-khi-that" ? "active" : ""}
              >
                Luyện khí thất
              </Button>
            </StyledLink>
            <StyledLink href="/nhiem-vu-duong" passHref>
              <Button
                className={activeSection === "/nhiem-vu-duong" ? "active" : ""}
              >
                Nhiệm vụ đường
              </Button>
            </StyledLink>
            <StyledLink href="/dao-khoang" passHref>
              <Button
                className={activeSection === "/dao-khoang" ? "active" : ""}
              >
                Đào khoáng
              </Button>
            </StyledLink>
            <StyledLink href="/duoc-vien" passHref>
              <Button
                className={activeSection === "/duoc-vien" ? "active" : ""}
              >
                Dược viên
              </Button>
            </StyledLink>
            <StyledLink href="/nhan-vat" passHref>
              <Button className={activeSection === "/nhan-vat" ? "active" : ""}>
                Nhân vật
              </Button>
            </StyledLink>
          </>
        )}
      </SidebarSection>

      <SidebarSection>
        <SectionTitle onClick={() => toggleSection("bangphai")}>
          Bang phái
        </SectionTitle>
        {openSections.bangphai && (
          <>
            <StyledLink href="/xin-vao-bang" passHref>
              <Button
                className={activeSection === "/xin-vao-bang" ? "active" : ""}
              >
                Xin vào bang
              </Button>
            </StyledLink>
            <StyledLink href="/nghi-su-dien" passHref>
              <Button
                className={activeSection === "/nghi-su-dien" ? "active" : ""}
              >
                Nghị sự điện
              </Button>
            </StyledLink>
            <StyledLink href="/bao-kho-phong" passHref>
              <Button
                className={activeSection === "/bao-kho-phong" ? "active" : ""}
              >
                Bảo khố phòng
              </Button>
            </StyledLink>
            {(parseInt(user?.clan_role) === 6 ||
              parseInt(user?.clan_role) === 7) && (
              <StyledLink href="/chap-su-duong" passHref>
                <Button
                  className={activeSection === "/chap-su-duong" ? "active" : ""}
                >
                  Chấp Sự Đường
                </Button>
              </StyledLink>
            )}
          </>
        )}
      </SidebarSection>
    </SidebarContainer>
  );
};

export default Sidebar;
