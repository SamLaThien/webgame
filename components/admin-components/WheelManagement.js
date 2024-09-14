import React, { useState, useEffect } from "react";
import styled from "styled-components";

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

const Container = styled.div`
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f2f2f2;
  text-align: left;
`;

const Td = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
`;

const Button = styled.button`
  padding: 5px 10px;
  margin-left: 5px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #f44336;

  &:hover {
    background-color: #d32f2f;
  }
`;

const AddPrizeButton = styled(Button)`
  background-color: #008cba;
  color: white;
  margin-bottom: 20px;

  &:hover {
    background-color: #007bb5;
  }
`;

const SaveChangesButton = styled(Button)`
  background-color: #4caf50;
  color: white;

  &:hover {
    background-color: #45a049;
  }
`;

const FormContainer = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const Select = styled.select`
  padding: 5px;
  margin-bottom: 10px;
  width: 100%;
  max-width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
`;

const Input = styled.input`
  padding: 5px;
  margin-bottom: 10px;
  width: 100%;
  max-width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
`;

const WheelManagement = () => {
  const [wheelSlots, setWheelSlots] = useState([]);
  const [vatPhamList, setVatPhamList] = useState([]);
  const [selectedSlotNumber, setSelectedSlotNumber] = useState("");
  const [selectedVatPham, setSelectedVatPham] = useState("");
  const [prizeRate, setPrizeRate] = useState("");
  const [lowerBound, setLowerBound] = useState("");
  const [higherBound, setHigherBound] = useState("");
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const slotsResponse = await fetch("/api/admin/wheel-slots", {
          headers,
        });
        const slots = await slotsResponse.json();

        if (Array.isArray(slots)) {
          setWheelSlots(slots);
        }

        const vatPhamResponse = await fetch("/api/admin/vat-pham", { headers });
        const vatPhamData = await vatPhamResponse.json();
        setVatPhamList(vatPhamData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddPrize = async () => {
    if (!selectedSlotNumber) {
      alert("Please select a slot number.");
      return;
    }

    let newPrize = {
      slot_number: parseInt(selectedSlotNumber, 10),
      prize_type: selectedSlotNumber > 4 ? "1" : "2",
    };

    if (selectedSlotNumber > 4) {
      if (!lowerBound || !higherBound) {
        alert("Please enter both lower and higher bounds.");
        return;
      }
      newPrize.lower_bound = parseInt(lowerBound, 10);
      newPrize.higher_bound = parseInt(higherBound, 10);
    } else {
      if (!selectedVatPham || !prizeRate) {
        alert("Please select a vat pham and enter a prize rate.");
        return;
      }

      const selectedVatPhamData = vatPhamList.find(
        (vatPham) => vatPham.ID === parseInt(selectedVatPham, 10)
      );

      if (!selectedVatPhamData) {
        alert("Selected vat pham is not valid.");
        return;
      }

      newPrize.option_text = selectedVatPhamData.Name;
      newPrize.item_id = selectedVatPhamData.ID;
      newPrize.prize_rate = parseFloat(prizeRate);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/wheel-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPrize),
      });

      if (response.ok) {
        const updatedSlots = [...wheelSlots, newPrize];
        setWheelSlots(updatedSlots);
        resetForm();
        alert("Prize added successfully!");
      } else {
        alert("Failed to add prize.");
      }
    } catch (error) {
      console.error("Error adding prize:", error);
    }
  };


  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setSelectedSlotNumber(slot.slot_number);
    if (slot.slot_number > 4) {
      setLowerBound(slot.lower_bound);
      setHigherBound(slot.higher_bound);
    } else {
      setSelectedVatPham(slot.item_id);
      setPrizeRate(slot.prize_rate);
    }
  };

  const handleVatPhamSelect = (e) => {
    const selectedItemId = e.target.value;
    const selectedVatPhamData = vatPhamList.find(
      (vatPham) => vatPham.ID === parseInt(selectedItemId, 10)
    );

    if (selectedVatPhamData) {
      setSelectedVatPham(selectedItemId);
      setEditingSlot({
        ...editingSlot,
        item_id: parseInt(selectedItemId, 10),
        option_text: selectedVatPhamData.Name,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSlot) return;

    let updatedSlot = {
      ...editingSlot,
      slot_number: parseInt(selectedSlotNumber, 10),
    };

    if (selectedSlotNumber > 4) {
      updatedSlot = {
        ...updatedSlot,
        lower_bound: parseInt(lowerBound, 10),
        higher_bound: parseInt(higherBound, 10),
      };
    } else {
      updatedSlot = {
        ...updatedSlot,
        item_id: parseInt(selectedVatPham, 10),
        prize_rate: parseFloat(prizeRate),
      };
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/wheel-slots/${editingSlot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSlot),
      });

      if (response.ok) {
        const updatedSlots = wheelSlots.map((slot) =>
          slot.id === editingSlot.id ? updatedSlot : slot
        );
        setWheelSlots(updatedSlots);
        resetForm();
        alert("Prize updated successfully!");
      } else {
        alert("Failed to update prize.");
      }
    } catch (error) {
      console.error("Error updating prize:", error);
      alert("An error occurred while updating the prize.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this prize?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/wheel-slots/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedSlots = wheelSlots.filter((slot) => slot.id !== id);
        setWheelSlots(updatedSlots);
        alert("Prize deleted successfully!");
      } else {
        alert("Failed to delete prize.");
      }
    } catch (error) {
      console.error("Error deleting prize:", error);
      alert("An error occurred while deleting the prize.");
    }
  };

  const resetForm = () => {
    setEditingSlot(null);
    setSelectedSlotNumber("");
    setSelectedVatPham("");
    setPrizeRate("");
    setLowerBound("");
    setHigherBound("");
  };

  return (
    <Container>
      <FormContainer>
        <SaveChangesButton onClick={handleSaveEdit}>Lưu thay đổi</SaveChangesButton>
        <AddPrizeButton onClick={handleAddPrize}>Thêm giải thưởng</AddPrizeButton>
        <Label>Chọn số slot:</Label>
        <Select
          value={selectedSlotNumber}
          onChange={(e) => setSelectedSlotNumber(e.target.value)}
        >
          <option value="">Select Slot Number</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </Select>

        {selectedSlotNumber > 4 ? (
          <>
            <Label>Lower Bound:</Label>
            <Input
              type="number"
              value={lowerBound}
              onChange={(e) => setLowerBound(e.target.value)}
              placeholder="Enter lower bound"
            />
            <Label>Higher Bound:</Label>
            <Input
              type="number"
              value={higherBound}
              onChange={(e) => setHigherBound(e.target.value)}
              placeholder="Enter higher bound"
            />
          </>
        ) : (
          <>
            <Label>Chọn vật phẩm:</Label>
            <Select value={selectedVatPham} onChange={handleVatPhamSelect}>
              <option value="">Select Vat Pham</option>
              {vatPhamList.map((vatPham) => (
                <option key={vatPham.ID} value={vatPham.ID}>
                  {vatPham.Name}
                </option>
              ))}
            </Select>

            <Label>Prize Rate:</Label>
            <Input
              type="number"
              value={prizeRate}
              onChange={(e) => setPrizeRate(e.target.value)}
              placeholder="Enter prize rate"
            />
          </>
        )}
      </FormContainer>

      <Table>
        <thead>
          <tr>
            <Th>Slot Number</Th>
            <Th>Prize Name</Th>
            <Th>Prize Rate</Th>
            <Th>Item ID</Th>
            <Th>Option Text</Th>
            <Th>Lower Bound</Th>
            <Th>Higher Bound</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {wheelSlots
            .sort((a, b) => a.slot_number - b.slot_number)
            .map((slot) => (
              <tr key={slot.id}>
                <Td>{slot.slot_number}</Td>
                <Td>{prizes[slot.slot_number - 1]}</Td>
                <Td>{slot.prize_rate}</Td>
                <Td>{slot.item_id}</Td>
                <Td>{slot.option_text}</Td>
                <Td>{slot.lower_bound}</Td>
                <Td>{slot.higher_bound}</Td>
                <Td>
                  <Button onClick={() => handleEdit(slot)}>Edit</Button>
                  <DeleteButton onClick={() => handleDelete(slot.id)}>
                    Delete
                  </DeleteButton>
                </Td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default WheelManagement;
