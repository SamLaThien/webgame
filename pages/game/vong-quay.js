import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import styled from "styled-components";
import moment from "moment";

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
  transition: transform 4s ease-out;
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

const VongQuayMayManPage = () => {
  const [spinValue, setSpinValue] = useState(0);
  const [prize, setPrize] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelSlots, setWheelSlots] = useState([]);
  const [spinLogs, setSpinLogs] = useState([]);
  const [taiSan, setTaiSan] = useState(0);

  const prizes = [
    "Đồ Thần Bí",   // slot_number = 1
    "Đồ Đột Phá",   // slot_number = 2
    "Đồ Luyện Khí", // slot_number = 3
    "Đồ Luyện Đan", // slot_number = 4
    "Giảm Kinh Nghiệm", // slot_number = 5
    "Tăng Kinh Nghiệm", // slot_number = 6
    "Cộng Bạc",     // slot_number = 7
    "Trừ Bạc"       // slot_number = 8
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
    if (isSpinning || wheelSlots.length === 0) return; // Prevent multiple spins
  
    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user"));
  
      const spinTokenResponse = await fetch("/api/user/game/vong-quay/spin-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: storedUser.id }),
      });
  
      const spinTokenData = await spinTokenResponse.json();
      const spinToken = spinTokenData.spinToken;
  
      const response = await fetch("/api/user/game/vong-quay/tai-san", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: storedUser.id }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setTaiSan(data.tai_san);
  
        const randomDegree = Math.floor(Math.random() * 360) + 3600;
        setSpinValue((prevValue) => prevValue + randomDegree);
        setIsSpinning(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error during the spin:", error);
    }
  }, [isSpinning, wheelSlots]);
  

  useEffect(() => {
    if (spinValue !== 0) {
      const duration = 4000;
      const timer = setTimeout(() => {
        const selectedPrizeIndex = Math.floor(
          (360 - (spinValue % 360)) / (360 / prizes.length)
        );

        const selectedSlotNumber = selectedPrizeIndex + 1; 

        const relevantSlots = wheelSlots.filter(slot => slot.slot_number === selectedSlotNumber);

        const prizeValue = calculatePrize(relevantSlots);
        setPrize(prizeValue);
        setIsSpinning(false);
        logSpinResult(prizes[selectedPrizeIndex], prizeValue);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [spinValue, wheelSlots]);

  const calculatePrize = (relevantSlots) => {
    if (!relevantSlots || relevantSlots.length === 0) return "Error: No slots available for selected category";

    const items = relevantSlots.flatMap(slot => slot.items);
    let totalWeight = items.reduce((sum, item) => sum + item.prize_rate, 0);
    let randomNum = Math.random() * totalWeight;

    for (let item of items) {
      if (randomNum < item.prize_rate) {
        return item.option_text;
      }
      randomNum -= item.prize_rate;
    }
    return null;
  };

  const logSpinResult = async (prizeCategory, prizeName) => {
    const token = localStorage.getItem("token");

    await fetch("/api/user/game/vong-quay/spin-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        prize_category: prizeCategory,
        prize_name: prizeName,
      }),
    });
  };

  return (
    <Layout>
      <WheelContainer>
        <Marker src="/wheel/2.png" alt="Marker" />
        <Image src="/spin/overlay2.png" alt="Image below the wheel" />
        <Wheel style={{ transform: `rotate(${spinValue}deg)` }} />
        <Button onClick={handleSpinClick} />
        {prize && <ResultMessage>Bạn đã trúng: {prize}</ResultMessage>}
      </WheelContainer>
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
