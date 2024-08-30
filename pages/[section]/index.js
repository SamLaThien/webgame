import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import HoSo from "@/components/user-components/HoSo";
import TinNhan from "@/components/user-components/TinNhan";
import DoiMatKhau from "@/components/user-components/DoiMatKhau";
import RuongChuaDo from "@/components/user-components/RuongChuaDo";
import DotPha from "@/components/user-components/DotPha";
import QuyThi from "@/components/user-components/QuyThi";
import LuyenDanThat from "@/components/user-components/LuyenDanThat";
import NhiemVuDuong from "@/components/user-components/NhiemVuDuong";
import DaoKhoang from "@/components/user-components/DaoKhoang";
import XinVaoBang from "@/components/user-components/XinVaoBang";
import NghiSuDien from "@/components/user-components/NghiSuDien";
import BaoKhoPhong from "@/components/user-components/BaoKhoPhong";
import Layout from "@/components/Layout";
import LuyenKhiThat from "@/components/user-components/LuyenKhiThat";
import DuocVien from "@/components/user-components/DuocVien";
import LanhSuDuong from "@/components/user-components/LanhSuDuong";
import axios from "axios";

const SectionPage = () => {
  const router = useRouter();
  const { section } = router.query;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isInClan, setIsInClan] = useState(false);

  const validateTokenAndFetchUserData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found, redirecting to login.");
      router.push("/login");
      return;
    }

    try {
      const { data } = await axios.get("/api/user/validate-token", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.isValid) {
        console.log("Token is valid, fetching user data.");

        const userInfoResponse = await axios.get(`/api/user/clan/user-info?userId=${data.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const clanResponse = await axios.get(`/api/user/clan/check-if-clan-member?userId=${data.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsInClan(clanResponse.data.isInClan);
        setUser({ ...userInfoResponse.data, isInClan: clanResponse.data.isInClan });
        setIsLoggedIn(true);
        console.log("User data and clan status set.");
      } else {
        console.log("Token is invalid, redirecting to login.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error during token validation or fetching user data:", error);
      router.push("/login");
    }
  };

  useEffect(() => {
    validateTokenAndFetchUserData();

    const intervalId = setInterval(() => {
      validateTokenAndFetchUserData();
    }, 5000);

    return () => clearInterval(intervalId); 
  }, [router]);

  console.log("User data", JSON.stringify(user));

  const getCurrentTitle = () => {
    switch (section) {
      case "ho-so":
        return "Thông Tin Cá Nhân";
      case "tin-nhan":
        return "Tin Nhắn";
      case "doi-mat-khau":
        return "Đổi Mật Khẩu";
      case "ruong-chua-do":
        return "Rương Đồ";
      case "dot-pha":
        return "Đột Phá";
      case "quy-thi":
        return "Quy Thị";
      case "luyen-dan-that":
        return "Luyện Đan Thất";
      case "luyen-khi-that":
        return "Luyện Khí Thất";
      case "nhiem-vu-duong":
        return "Nhiệm Vụ Đường";
      case "dao-khoang":
        return "Đào Khoáng";
      case "xin-vao-bang":
        return "Xin Vào Bang";
      case "nghi-su-dien":
        return "Nghị Sự Điện";
      case "bao-kho-phong":
        return "Bảo Khố Phòng";
      case "duoc-vien":
        return "Dược Viên";
      case "chap-su-duong":
        return "Chấp Sự Đường";
      default:
        return "Thông Tin Cá Nhân";
    }
  };

  const getCurrentComponent = () => {
    switch (section) {
      case "ho-so":
        return <HoSo />;
      case "tin-nhan":
        return <TinNhan />;
      case "doi-mat-khau":
        return <DoiMatKhau />;
      case "ruong-chua-do":
        return <RuongChuaDo />;
      case "dot-pha":
        return <DotPha />;
      case "quy-thi":
        return <QuyThi />;
      case "luyen-dan-that":
        return <LuyenDanThat />;
      case "luyen-khi-that":
        return <LuyenKhiThat />;
      case "nhiem-vu-duong":
        return <NhiemVuDuong />;
      case "dao-khoang":
        return <DaoKhoang />;
      case "xin-vao-bang":
        return <XinVaoBang />;
      case "nghi-su-dien":
        return <NghiSuDien />;
      case "bao-kho-phong":
        return <BaoKhoPhong />;
      case "duoc-vien":
        return <DuocVien />;
      case "chap-su-duong":
        return <LanhSuDuong />;
      default:
        return <HoSo />;
    }
  };

  return (
    <>
      <Head>
        <title>{getCurrentTitle()}</title>
      </Head>
      <Layout isLoggedIn={isLoggedIn} user={user} isInClan={isInClan}>
        {getCurrentComponent()}
      </Layout>
    </>
  );
};

export default SectionPage;
