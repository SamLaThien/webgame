import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Modal from "react-modal";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import axios from "axios";

const Container = styled.div`
  background: white;
  display: flex;
  flex-wrap: wrap; /* Allows sections to wrap onto new lines */
  justify-content: center; /* Centers sections horizontally */
  gap: 12px;
  padding: 12px;
  border-radius: 0;
  margin-bottom: 20px;
  max-width: 1200px; /* Adjust as needed */
  margin: 0 auto;
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

const Section = styled.div`
  background: rgba(255, 255, 255);
  padding: 20px;
  border-radius: 0;
  width: calc(33.333% - 24px); /* Adjust to fit three sections per row including gap */
  border: 1px solid #93b6c8;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content inside each section */
  margin-bottom: 12px; /* Add margin to create space between rows */

  @media (max-width: 1200px) {
    width: calc(50% - 24px); /* Two sections per row on medium screens */
  }

  @media (max-width: 768px) {
    width: calc(100% - 24px); /* One section per row on small screens */
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;
`;

const UserInfoItem = styled.p`
  margin: 5px 0;
  font-size: 16px;
`;

const Link = styled.a`
  color: #0070f3;
  text-decoration: none;
  font-weight: bold; /* Make the font bold */
  &:hover {
    text-decoration: underline;
  }
`;

const CalligraphyTitle = styled.h3`
  font-family: 'Dancing Script', cursive;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
`;

Modal.setAppElement("#__next");

const PhongThanBang = () => {
    const [user, setUser] = useState(null);
    const [topUsers, setTopUsers] = useState([]);
    const [topTaiSans, setTopTaiSans] = useState([]);
    const [topLuyenDans, setTopLuyenDans] = useState([]);
    const [topLuyenKhis, setTopLuyenKhis] = useState([]);
    const [topBangHois, setTopBangHois] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await axios.get("/api/user", {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (response.status === 200) {
                        setUser(response.data);
                        const responses = await axios.post("/api/user/phong-than", null, {
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        if (responses.status === 200) {
                            console.log("Data received:", responses.data);
                            setTopUsers(responses.data.topUsers || []);
                            setTopTaiSans(responses.data.topTaiSans || []);
                            setTopLuyenDans(responses.data.topLuyenDans || []);
                            setTopLuyenKhis(responses.data.topLuyenKhis || []);
                            setTopBangHois(responses.data.topBangHois || []);
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
        fetchData();
    }, [router]);

    if (!user) return null;

    return (
        <>
            <SectionTitle>
                <AccountCircleOutlinedIcon />
                <CalligraphyTitle>
                    PHONG THẦN BẢNG
                </CalligraphyTitle>
            </SectionTitle>
            <Container>
                <Section>
                    <UserInfo>
                        <UserInfoItem>
                            <CalligraphyTitle>Bảng Tu Vi</CalligraphyTitle>
                        </UserInfoItem>
                        {topUsers.length > 0 ? (
                            topUsers.map((user, index) => (
                                <UserInfoItem key={user.id}>
                                    {index + 1}.
                                    <Link
                                        href={`https://tuchangioi.xyz/member/${user.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {user.username}
                                    </Link>
                                </UserInfoItem>
                            ))
                        ) : (
                            <UserInfoItem>No data available</UserInfoItem>
                        )}
                    </UserInfo>
                </Section>
                <Section>
                    <UserInfo>
                        <UserInfoItem>
                            <CalligraphyTitle>Bảng Tài Phú</CalligraphyTitle>
                        </UserInfoItem>
                        {topTaiSans.length > 0 ? (
                            topTaiSans.map((user, index) => (
                                <UserInfoItem key={user.id}>
                                    {index + 1}.
                                    <Link
                                        href={`https://tuchangioi.xyz/member/${user.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {user.username}
                                    </Link>
                                </UserInfoItem>
                            ))
                        ) : (
                            <UserInfoItem>No data available</UserInfoItem>
                        )}
                    </UserInfo>
                </Section>
                <Section>
                    <UserInfo>
                        <UserInfoItem>
                            <CalligraphyTitle>Luyện Đan Sư</CalligraphyTitle>
                        </UserInfoItem>
                        {topLuyenDans.length > 0 ? (
                            topLuyenDans.map((user, index) => (
                                <UserInfoItem key={user.id}>
                                    {index + 1}.
                                    <Link
                                        href={`https://tuchangioi.xyz/member/${user.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {user.username}
                                    </Link>
                                </UserInfoItem>
                            ))
                        ) : (
                            <UserInfoItem>No data available</UserInfoItem>
                        )}
                    </UserInfo>
                </Section>
                <Section>
                    <UserInfo>
                        <UserInfoItem>
                            <CalligraphyTitle>Luyện Khí Sư</CalligraphyTitle>
                        </UserInfoItem>
                        {topLuyenKhis.length > 0 ? (
                            topLuyenKhis.map((user, index) => (
                                <UserInfoItem key={user.id}>
                                    {index + 1}.
                                    <Link
                                        href={`https://tuchangioi.xyz/member/${user.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {user.username}
                                    </Link>
                                </UserInfoItem>
                            ))
                        ) : (
                            <UserInfoItem>No data available</UserInfoItem>
                        )}
                    </UserInfo>
                </Section>
                <Section>
                    <UserInfo>
                        <UserInfoItem>
                            <CalligraphyTitle>Bang Hội</CalligraphyTitle>
                        </UserInfoItem>
                        {topBangHois.length > 0 ? (
                            topBangHois.map((user, index) => (
                                <UserInfoItem key={user.id}>
                                    {user.name}
                                </UserInfoItem>
                            ))
                        ) : (
                            <UserInfoItem>No data available</UserInfoItem>
                        )}
                    </UserInfo>
                </Section>
            </Container>
        </>
    );
};

export default PhongThanBang;
