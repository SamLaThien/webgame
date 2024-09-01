import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import styled from "styled-components";
import moment from "moment";
import CboxGeneral from "@/components/CboxGeneral";
import { chat } from "./helper.js";

const WheelContainer = styled.div`
  position: relative;
  width: 80vw;
  height: 80vw;
  max-width: 500px;
  max-height: 500px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  position: absolute;
  top: 50%;
  left: 49%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  object-fit: cover;
  pointer-events: none;
  @media (max-width: 749px) {
    width: 130%;
    height: 100%;
  }
`;

const Wheel = styled.div`
  position: absolute;
  width: 75%;
  height: 75%;
  background-image: url("/wheel/1.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 50%;
  transform-origin: center center;
  transition: ${({ instantReset }) =>
    instantReset ? "none" : "transform 4s ease-out"};
  will-change: transform;
`;

const Button = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background-image: url("/spin/center.png");
  background-size: 450px;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 4;
  @media (max-width: 749px) {
    width: 70px;
  height: 70px;
  background-size: 300;
  }
`;

const AutoSpinButton = styled.button`
position: absolute;
  left: 50%;
  transform: translate(-50%);
  padding: 10px 20px;
  background-color: ${({ isActive }) => (isActive ? "#DC143C" : "#1E90FF")};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 40px;
  
  &:hover {
    background-color: ${({ isActive }) => (isActive ? "#c1121f" : "#1c86ee")};
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ResultMessage = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -100%);
  padding: 10px;
  color: red;
  border-radius: 5px;
  font-size: 1.5rem;
  text-align: center;
`;

const Marker = styled.img`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  z-index: 5;
`;
const LowerSection = styled.div`
  margin-top: 120px;
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 0;
  height: 150vh;
  min-height: 150vh;
  flex-grow: 1;
  @media (max-width: 749px) {
    flex-direction: column;
  }
`;

const LogContainer = styled.div`
  width: calc(55vw + 1vw);
  height: calc(50vh + 1vh);
  border: 1px solid #93b6c8;
  padding: 20px;
  overflow-y: scroll;
  background-color: white;
  @media (max-width: 749px) {
    width: 80vw;
  }
`;
const LogTitle = styled.h2`
  text-align: center;
  margin-top: 0;
  margin-bottom: 12px;
`;
const LogItem = styled.div`
  padding: 8px;
  border: 1px solid #93b6c8;
  font-size: 14px;
`;

const CategoryText = styled.span`
color: rgba(255, 255, 255, 0.1);
color: ${(props) => categoryColors[props.category] || "rgba(255, 255, 255, 0.1)"};
  font-weight: bold;
  position: relative;
  text-shadow: none;
  background: -webkit-gradient(linear, left top, right top, from(${(props) => categoryColors[props.category]}), to(${(props) => categoryColors[props.category]}), color-stop(0.5, #0e0e0e)) 0 0 no-repeat;
  -webkit-background-clip: text;
  -webkit-background-size: 30px;
  -webkit-animation: shine 2s infinite;
  @-webkit-keyframes shine {
    0% {
        background-position: top left;
    }
    100% {
        background-position: top right;
    }
}
`;


const categoryColors = {
  "Đồ Thần Bí": "#FFD700",
  "Đồ Đột Phá": "#8A2BE2", // BlueViolet
  "Đồ Luyện Khí": "#00CED1", // DarkTurquoise
  "Đồ Luyện Đan": "#FF4500", // OrangeRed
  "Giảm Kinh Nghiệm": "#FF6347", // Tomato
  "Tăng Kinh Nghiệm": "#32CD32", // LimeGreen
  "Cộng Bạc": "#1E90FF", // DodgerBlue
  "Trừ Bạc": "#DC143C", // Crimson
};

const VongQuayMayManPage = () => {
  const [spinValue, setSpinValue] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelSlots, setWheelSlots] = useState([]);
  const [spinLogs, setSpinLogs] = useState([]);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const prizes = [
    "Đồ Thần Bí", // slot_number = 1
    "Đồ Đột Phá", // slot_number = 2
    "Đồ Luyện Khí", // slot_number = 3
    "Đồ Luyện Đan", // slot_number = 4
    "Giảm Kinh Nghiệm", // slot_number = 5
    "Tăng Kinh Nghiệm", // slot_number = 6
    "Cộng Bạc", // slot_number = 7
    "Trừ Bạc", // slot_number = 8
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/api/admin/wheel-slot-groups", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((groups) => {
        if (Array.isArray(groups)) {
          fetch("/api/admin/wheel-slots", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((slots) => {
              if (Array.isArray(slots)) {
                const groupedSlots = groups.map((group) => ({
                  option: group.group_name,
                  style: {
                    backgroundColor: group.background_color,
                    textColor: group.text_color,
                  },
                  items: slots.filter(
                    (slot) => slot.slot_number === group.slot_number
                  ),
                }));
                setWheelSlots(groupedSlots);
              }
            });
        }
      });

    const fetchLogs = async () => {
      try {
        const logsResponse = await fetch("/api/user/game/vong-quay/spin-logs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const logs = await logsResponse.json();

        const formattedLogs = logs.map((log) => ({
          ...log,
          formattedTime: formatTimeDifference(log.timestamp),
        }));

        setSpinLogs(formattedLogs.slice(0, 30));
      } catch (error) {
        console.error("Error fetching spin logs:", error);
      }
    };
    fetchLogs();

    const intervalId = setInterval(fetchLogs, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSpinClick = useCallback(async () => {
    if (isSpinning) {
      setErrorMessage("Đạo hữu quay quá nhanh");
      setTimeout(() => {
        setIsSpinning(false);
        setSpinValue(0);
      }, 4000);
      return;
    }
    setErrorMessage("");
    if (wheelSlots.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user"));

      let spinToken;
      try {
        const spinTokenResponse = await fetch(
          "/api/user/game/vong-quay/spin-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: storedUser.id }),
          }
        );

        const spinTokenData = await spinTokenResponse.json();
        spinToken = spinTokenData.spinToken;
      } catch (error) {
        console.error("Error fetching spin token:", error);
        return;
      }

      let taiSanData;
      try {
        const response = await fetch("/api/user/game/vong-quay/tai-san", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: storedUser.id }),
        });

        taiSanData = await response.json();

        if (!response.ok) {
          console.error("Error fetching tai san:", taiSanData.message);
          return;
        }
      } catch (error) {
        console.error("Error fetching tai san:", error);
        return;
      }

      const randomDegree = Math.floor(Math.random() * 360) + 3600;
      setSpinValue(randomDegree);
      setIsSpinning(true);

      setTimeout(async () => {
        const selectedPrizeIndex = Math.floor(
          (360 - (randomDegree % 360)) / (360 / prizes.length)
        );

        const selectedSlotNumber = selectedPrizeIndex + 1;

        let prizeValue;
        let prizeName;
        let item_id;
        try {
          if (selectedSlotNumber >= 1 && selectedSlotNumber <= 4) {
            const itemApiResponse = await fetch(
              "/api/user/game/vong-quay/item",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  userId: storedUser.id,
                  spinToken,
                  slot_number: selectedSlotNumber,
                }),
              }
            );

            const itemApiData = await itemApiResponse.json();
            item_id = itemApiData.item_id
            prizeName = `${itemApiData.amonut} ${itemApiData.item}`;
            if (itemApiData.amonut > 1) {
              chat(`[b]Chúc mừng đạo hữu ${itemApiData.username} âu hoàng phụ thể nhận được ${prizeName}[/b]`)
            }
            prizeValue = prizeName;
          } else if (selectedSlotNumber >= 5 && selectedSlotNumber <= 8) {
            const expResponse = await fetch("/api/user/game/vong-quay/exp", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                userId: storedUser.id,
                spinToken,
                slot_number: selectedSlotNumber,
              }),
            });
            const expData = await expResponse.json();

            if (selectedSlotNumber === 5 || selectedSlotNumber === 6) {
              prizeName = `${expData.prize} ${prizes[selectedPrizeIndex].split(" ")[1]
                } nghiệm`;
            } else {
              prizeName = `${expData.prize} ${prizes[selectedPrizeIndex].split(" ")[1]
                }`;
            }

            prizeValue = prizeName;
          }

          const logResult = {
            username: storedUser.username,
            prize_category: prizes[selectedPrizeIndex],
            item_id: item_id,
            prize_name: prizeName,
          };

          await fetch("/api/user/game/vong-quay/spin-logs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(logResult),
          });

          setTimeout(() => {
            setIsSpinning(false);
            setSpinValue(0);
          }, 100);
        } catch (error) {
          console.error("Error calculating prize:", error);
          alert("Error calculating prize");
        }
      }, 4000);
    } catch (error) {
      console.error("Error during the spin:", error);
    }
  }, [isSpinning, wheelSlots]);

  useEffect(() => {
    let autoSpinInterval;
    if (isAutoSpinning) {
      autoSpinInterval = setInterval(() => {
        handleSpinClick();
      }, 5000); // 4.2 seconds
    }

    return () => {
      if (autoSpinInterval) {
        clearInterval(autoSpinInterval);
      }
    };
  }, [isAutoSpinning, handleSpinClick]);

  const getRandomItemPrize = async (slotNumber) => {
    const relevantSlots = wheelSlots.flatMap((slot) =>
      slot.slot_number === slotNumber ? slot.items : []
    );

    let totalWeight = relevantSlots.reduce(
      (sum, item) => sum + item.prize_rate,
      0
    );
    let randomNum = Math.random() * totalWeight;

    for (let item of relevantSlots) {
      if (randomNum < item.prize_rate) {
        return item.option_text;
      }
      randomNum -= item.prize_rate;
    }

    return null;
  };

  return (
    <Layout>
      <WheelContainer>
        <Marker src="/wheel/2.png" alt="Marker" />
        <Image src="/spin/overlay2.png" alt="Image below the wheel" />
        <Wheel
          instantReset={!isSpinning && spinValue === 0}
          style={{ transform: `rotate(${spinValue}deg)` }}
        />
        <Button onClick={handleSpinClick} />
      </WheelContainer>
      {errorMessage && <ResultMessage>{errorMessage}</ResultMessage>}
      <AutoSpinButton
        isActive={isAutoSpinning}
        onClick={() => setIsAutoSpinning((prev) => !prev)}
      >
        {isAutoSpinning ? "Dừng Quay" : "Tự Quay"}
      </AutoSpinButton>
      <LowerSection>
        <LogContainer>
          <LogTitle>Lịch Sử Quay</LogTitle>
          {spinLogs && spinLogs.length > 0 ? (
            spinLogs.map((log, index) => (
              <LogItem key={index}>
                <a
                  href={`https://tuchangioi.xyz/member/${log.user_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
                >
                  {log.username}
                </a>{" "}{" "} quay trúng{" "}
                <CategoryText category={log.prize_category}>
                  {log.prize_category}
                </CategoryText>{" "}
                ({log.prize_name}) ({log.formattedTime})
              </LogItem>
            ))
          ) : (
            <p>No spin logs available.</p>
          )}
        </LogContainer>
        <CboxGeneral />
      </LowerSection>
    </Layout>
  );
};

export default VongQuayMayManPage;

function formatTimeDifference(timestamp) {
  const now = moment();
  const logTime = moment(timestamp);
  const duration = moment.duration(now.diff(logTime));

  const hours = duration.asHours();
  const minutes = duration.asMinutes();

  if (hours >= 1) {
    return `${Math.floor(hours)} giờ trước`;
  } else {
    if (Math.floor(minutes) <= 0) {
      return `vừa xong`;
    } else
      return `${Math.floor(minutes)} phút trước`;
  }
}