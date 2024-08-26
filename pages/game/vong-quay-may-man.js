import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import styled from "styled-components";
import moment from "moment";
import CboxGeneral from "@/components/CboxGeneral";

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
    width: 100%;
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
`;

const ResultMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -150%);
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
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
  margin-top: 40px;
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
  width: calc(40vw + 1vw);
  height: calc(40vh + 1vh);
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

const VongQuayMayManPage = () => {
  const [spinValue, setSpinValue] = useState(0);
  const [prize, setPrize] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelSlots, setWheelSlots] = useState([]);
  const [spinLogs, setSpinLogs] = useState([]);
  const [taiSan, setTaiSan] = useState(0);
  const initialSpinValue = 0;

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

    fetch("/api/user/game/vong-quay/spin-logs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((logs) => {
        const formattedLogs = logs.map((log) => ({
          ...log,
          formattedTime: formatTimeDifference(log.timestamp),
        }));
        setSpinLogs(formattedLogs);
      });
  }, []);

  const handleSpinClick = useCallback(async () => {
    if (isSpinning || wheelSlots.length === 0) return;

    try {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        let spinToken;
        try {
            const spinTokenResponse = await fetch("/api/user/game/vong-quay/spin-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: storedUser.id }),
            });

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

            setTaiSan(taiSanData.tai_san);
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
            try {
                if (selectedSlotNumber >= 1 && selectedSlotNumber <= 4) {
                    // Call item API and get the prize
                    const itemApiResponse = await fetch("/api/user/game/vong-quay/item", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ userId: storedUser.id, spinToken, slot_number: selectedSlotNumber }),
                    });

                    const itemApiData = await itemApiResponse.json();
                    prizeName = `${itemApiData.item} x1`;  // Include item name and quantity
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
                    prizeName = `${expData.prize} ${prizes[selectedPrizeIndex].split(' ')[1]}`; // Log the amount of EXP/Bạc won
                    prizeValue = prizeName;

                }

                setPrize(`${prizes[selectedPrizeIndex]}: ${prizeName}`);

                // Log the prize result
                const logResult = {
                    username: storedUser.username,
                    prize_category: prizes[selectedPrizeIndex],
                    prize_name: prizeName,  // Use prizeName directly
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
        {prize && <ResultMessage>Bạn đã trúng: {prize}</ResultMessage>}
      </WheelContainer>
      <LowerSection>
        <LogContainer>
          <LogTitle>Lịch Sử Quay</LogTitle>
          {spinLogs && spinLogs.length > 0 ? (
            spinLogs.map((log, index) => (
              <LogItem key={index}>
                <strong>{log.username}</strong> quay trúng{" "}
                <strong>{log.prize_category}</strong> ({log.prize_name}) (
                {log.formattedTime})
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
    return `${Math.floor(minutes)} phút trước}`;
  }
}
