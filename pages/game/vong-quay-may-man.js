import React, { useState, useEffect } from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import CboxGeneral from "@/components/CboxGeneral";
import moment from "moment";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  height: 120vh;
  width: 100vw;
`;
const Image = styled.img`
  margin-top: calc(-7vw - 1vw);
  margin-left: -0.5vw;
  width: calc(38vw + 1vw);
  height: auto;
  z-index: -1;
  position: absolute;
`;
const Image2 = styled.img`
  margin-top: 7vh;
  width: calc(15vw + 1vw);
  height: auto;
  z-index: 100000;
  position: absolute;
`;
const Button = styled.button`
  padding: 10px 20px;
  margin-top: 10vh;
  background-color: #b3d7e8;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  font-size: larger;
`;
const LowerSection = styled.div`
  margin-top: 40px;
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const LogContainer = styled.div`
  width: calc(40vw + 1vw);
  border: 1px solid #93b6c8;
  padding: 20px;
  overflow-y: auto;
  background-color: white;
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
  const [wheelSlots, setWheelSlots] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [spinLogs, setSpinLogs] = useState([]);

  const formatTimeDifference = (timestamp) => {
    const now = moment();
    const logTime = moment(timestamp);
    const duration = moment.duration(now.diff(logTime));

    const hours = duration.asHours();
    const minutes = duration.asMinutes();

    if (hours >= 1) {
      return `${Math.floor(hours)} giờ trước`;
    } else {
      return `${Math.floor(minutes)} phút trước`;
    }
  };

  useEffect(() => {
    // Fetch the wheel data
    fetch("/api/admin/wheel-slot-groups")
      .then((res) => res.json())
      .then((groups) => {
        if (Array.isArray(groups)) {
          fetch("/api/admin/wheel-slots")
            .then((res) => res.json())
            .then((slots) => {
              if (Array.isArray(slots)) {
                const groupedSlots = groups.map((group) => ({
                  option: group.group_name,
                  style: {
                    backgroundColor: group.background_color,
                    textColor: group.text_color,
                    borderWidth: '1px', 
                    borderStyle: 'transparent', 
                    borderColor: 'white',
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

    fetch("/api/user/game/vong-quay/spin-logs")
      .then((res) => res.json())
      .then((logs) => {
        const formattedLogs = logs.map((log) => ({
          ...log,
          formattedTime: formatTimeDifference(log.timestamp),
        }));
        setSpinLogs(formattedLogs);
      });
  }, []);

  const handleSpinClick = () => {
    const newPrizeIndex = Math.floor(Math.random() * wheelSlots.length);
    setPrizeIndex(newPrizeIndex);
    setMustSpin(true);
  };

  const calculatePrize = (slot) => {
    if (!slot) return "Error: Slot data missing";

    if (slot.items[0]?.prize_type === 1) {
      const itemWithBounds = slot.items[0];
      const min = itemWithBounds.lower_bound;
      const max = itemWithBounds.higher_bound;

      if (min !== null && max !== null && min <= max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      } else {
        return "Invalid Range";
      }
    } else {
      const items = slot.items || [];
      let totalWeight = items.reduce((sum, item) => sum + item.prize_rate, 0);
      let randomNum = Math.random() * totalWeight;

      for (let item of items) {
        if (randomNum < item.prize_rate) {
          return item.option_text;
        }
        randomNum -= item.prize_rate;
      }
      return null;
    }
  };

  const handlePrizeResult = async () => {
    const selectedSlot = wheelSlots[prizeIndex];
    const prizeValue = calculatePrize(selectedSlot);

    if (!selectedSlot || !prizeValue) {
      setResult("Error: Prize calculation failed");
      setMustSpin(false);
      return;
    }

    console.log("Selected Slot:", selectedSlot);
    console.log("Prize Value:", prizeValue);

    if (selectedSlot.items[0]?.prize_type === 1) {
      console.log("Prize Type: Exp/Bac");
      await updateUserExpOrBac(selectedSlot.option, prizeValue);
    } else if (selectedSlot.items[0]?.prize_type === 2) {
      console.log("Prize Type: Item");
      const vatPhamId = await getVatPhamId(prizeValue);
      if (vatPhamId) {
        await updateUserItem(vatPhamId, 1);
      }
    }
    await logSpinResult(selectedSlot.option, prizeValue);

    setResult(prizeValue);
    setMustSpin(false);
  };

  const logSpinResult = async (prizeCategory, prizeName, quantity) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.id) {
        throw new Error("User not found in local storage");
      }

      const username = storedUser.name;
      const userId = storedUser.id;
      const response = await fetch("/api/user/game/vong-quay/spin-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          username,
          prize_category: prizeCategory,
          prize_name: prizeName,
          quantity,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to log spin result");
      }

      setSpinLogs((prevLogs) => [...prevLogs, data]);
    } catch (error) {
      console.error("Error logging spin result:", error);
    }
  };

  function normalizePrizeName(prize) {
    return prize
      .toLowerCase()
      .normalize("NFD") // Decompose special characters
      .replace(/[\u0300-\u036f]/g, ""); // Remove diacritical marks
  }

  async function updateUserExpOrBac(prize, amount) {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.id) {
        throw new Error("User not found in local storage");
      }

      const userId = storedUser.id;
      const normalizedPrize = normalizePrizeName(prize);

      console.log("Updating User:", { userId, prize: normalizedPrize, amount }); // Log to verify data

      const response = await fetch("/api/user/game/vong-quay/exp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          prize: normalizedPrize,
          amount,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update Exp/Bac");
      }
      console.log("User Exp/Bac updated successfully:", data);
    } catch (error) {
      console.error("Error updating Exp/Bac:", error);
    }
  }

  async function updateUserItem(vat_pham_id) {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.id) {
        throw new Error("User not found in local storage");
      }

      const userId = storedUser.id;

      const response = await fetch("/api/user/game/vong-quay/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          vat_pham_id,
          so_luong: 1, // Assuming the quantity won is 1
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add item to Ruong Do");
      }
      console.log("Item added to Ruong Do successfully:", data);
    } catch (error) {
      console.error("Error updating Ruong Do:", error);
    }
  }

  return (
    <Layout>
      <Container>
        {wheelSlots.length > 0 && (
          <>
          <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeIndex}
              data={wheelSlots.map((slot) => ({
                option: slot.option,
                style: {
                  ...slot.style,
                  borderWidth: '1px', 
                  borderStyle: 'solid',
                  borderColor: 'white',
                },
                
              }))}
              outerBorderWidth={1}
              outerBorderColor="gold"
              radiusLineColor="gold"
              radiusLineWidth={1} 
              onStopSpinning={handlePrizeResult}
            />
            <Button onClick={handleSpinClick}>Quay</Button>
            {result && <p>You won: {result}</p>}
          </>
        )}
        <Image src="/spin/overlay2.png" alt="Image below the wheel" />
        <Image2 src="/spin/center.png" alt="Image below the wheel" />

        <LowerSection>
          <LogContainer>
            <LogTitle>Lịch Sử Quay</LogTitle>
            {spinLogs && spinLogs.length > 0 ? (
              spinLogs.map((log, index) => (
                <LogItem key={index}>
                  <strong>{log.username}</strong> Quay trúng{" "}
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
      </Container>
    </Layout>
  );
};

export default VongQuayMayManPage;

// async function updateUserGameResult(prize, amount) {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     if (!storedUser || !storedUser.id) {
//       throw new Error("User not found in local storage");
//     }

//     const userId = storedUser.id;

//     const response = await fetch("/api/user/game/vong-quay", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ userId, prize, amount }),
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data.message || "Something went wrong");
//     }
//     console.log("User updated successfully:", data);
//   } catch (error) {
//     console.error("Error updating user:", error);
//   }
// }

async function getVatPhamId(prizeName) {
  try {
    const response = await fetch(
      `/api/user/game/vong-quay/vat-pham?name=${encodeURIComponent(prizeName)}`
    );
    const data = await response.json();

    if (response.ok && data && data.ID) {
      return data.ID;
    } else {
      console.error(
        "Error fetching vat_pham ID:",
        data.message || "Invalid response"
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching vat_pham ID:", error);
    return null;
  }
}

// async function updateUserRuongDo(vatPhamId, soLuong) {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     if (!storedUser || !storedUser.id) {
//       throw new Error("User not found in local storage");
//     }

//     const userId = storedUser.id;

//     const response = await fetch("/api/user/game/vong-quay", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ userId, vatPhamId, soLuong }),
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data.message || "Something went wrong");
//     }
//     console.log("Item added to ruong_do successfully:", data);
//   } catch (error) {
//     console.error("Error updating ruong_do:", error);
//   }
// }
