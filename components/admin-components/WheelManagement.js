import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

const Wheel = dynamic(() => import('react-custom-roulette').then(mod => mod.Wheel), { ssr: false });

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
`;

const SlotManagementContainer = styled.div`
  flex: 2;
  margin-right: 20px;
  max-width: 800px;
`;

const EditPanel = styled.div`
  flex: 1;
  position: sticky;
  top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
`;

const SlotItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
`;

const TestButton = styled(Button)`
  margin-top: 20px;
`;

const ResultContainer = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const EditInput = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const AddItemButton = styled(Button)`
  background-color: #008CBA;
  margin-top: 10px;
`;

const ColorDisplay = styled.div`
  height: 20px;
  width: 100%;
  background-color: ${(props) => props.color};
  margin-bottom: 10px;
  border-radius: 5px;
`;

const WheelManagement = () => {
  const [wheelSlots, setWheelSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/admin/wheel-slot-groups')
      .then(res => res.json())
      .then(groups => {
        if (Array.isArray(groups)) {
          fetch('/api/admin/wheel-slots')
            .then(res => res.json())
            .then(slots => {
              if (Array.isArray(slots)) {
                const groupedSlots = groups.map(group => ({
                  ...group,
                  items: slots.filter(slot => slot.slot_number === group.slot_number),
                }));
                setWheelSlots(groupedSlots);
              }
            });
        }
      });
  }, []);

  const handleEditSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleEditStyle = (slot) => {
    setSelectedStyle(slot);
  };

  const handleDeleteItem = (slotNumber, itemId) => {
    const updatedSlot = {
      ...selectedSlot,
      items: selectedSlot.items.filter(item => item.id !== itemId),
    };

    setSelectedSlot(updatedSlot);
    setWheelSlots(wheelSlots.map(slot =>
      slot.slot_number === slotNumber ? updatedSlot : slot
    ));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      option_text: '',
      prize_rate: 0,
    };

    const updatedSlot = {
      ...selectedSlot,
      items: [...selectedSlot.items, newItem],
    };

    setSelectedSlot(updatedSlot);
  };

  const handleChangeItem = (itemId, key, value) => {
    const updatedItems = selectedSlot.items.map(item =>
      item.id === itemId ? { ...item, [key]: value } : item
    );

    setSelectedSlot({ ...selectedSlot, items: updatedItems });
  };

  const handleUpdateItems = (e) => {
    e.preventDefault();

    const updatedSlot = {
      ...selectedSlot,
      items: selectedSlot.items.map(item => ({
        id: item.id,
        option_text: item.option_text,
        prize_rate: item.prize_rate,
      })),
    };

    fetch(`/api/admin/wheel-slots/${selectedSlot.slot_number}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSlot),
    }).then(() => {
      setWheelSlots(wheelSlots.map(slot =>
        slot.slot_number === selectedSlot.slot_number ? updatedSlot : slot
      ));
      setSelectedSlot(null);  // Clear the form after updating
    });
  };

  const handleUpdateStyle = (e) => {
    e.preventDefault();

    fetch(`/api/admin/wheel-slot-groups/${selectedStyle.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedStyle),
    }).then(() => {
      setWheelSlots(wheelSlots.map(slot =>
        slot.slot_number === selectedStyle.slot_number ? selectedStyle : slot
      ));
      setSelectedStyle(null);  // Clear the form after updating
    });
  };

  const handleSpinClick = () => {
    const newPrizeNumber = Math.floor(Math.random() * wheelSlots.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const calculatePrize = (slot) => {
    if (slot.prize_type === 1) {
      // If prize_type is 1, randomize between lower_bound and higher_bound
      const min = slot.lower_bound;
      const max = slot.higher_bound;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      // If prize_type is not 1, handle the logic for item-based prize selection
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
  

  const handleStopSpinning = () => {
    setMustSpin(false);
    const selectedSlot = wheelSlots[prizeNumber];
    const prizeValue = calculatePrize(selectedSlot);
    setResult(`You won: ${prizeValue}`);
  };

  return (
    <Container>
      <SlotManagementContainer>
        <h2>Preview Wheel</h2>
        {wheelSlots.length > 0 && (
          <>
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelSlots.map(slot => ({
                option: slot.group_name,
                style: {
                  backgroundColor: slot.background_color,
                  textColor: slot.text_color,
                }
              }))}
              onStopSpinning={handleStopSpinning}
            />
            <TestButton onClick={handleSpinClick}>Test Spin</TestButton>
            {result && (
              <ResultContainer>
                <h3>Congratulations!</h3>
                <p>{result}</p>
              </ResultContainer>
            )}
          </>
        )}
        <h3>Manage Wheel Slots</h3>
        {wheelSlots.map(slot => (
          <SlotItem key={slot.slot_number}>
            <span>
              Slot {slot.slot_number}: {slot.group_name} - {slot.items?.length || 0} items
            </span>
            <Button onClick={() => handleEditSlot(slot)}>Edit Items</Button>
            <Button onClick={() => handleEditStyle(slot)}>Edit Style</Button>
          </SlotItem>
        ))}
      </SlotManagementContainer>
      {selectedSlot && (
        <EditPanel>
          <h3>Edit Slot Items for Slot {selectedSlot.slot_number}</h3>
          <EditForm onSubmit={handleUpdateItems}>
            <h4>Items</h4>
            {selectedSlot.items.map(item => (
              <ItemRow key={item.id}>
                <EditInput
                  type="text"
                  value={item.option_text}
                  onChange={(e) => handleChangeItem(item.id, 'option_text', e.target.value)}
                  placeholder="Option Text"
                />
                <EditInput
                  type="number"
                  value={item.prize_rate}
                  onChange={(e) => handleChangeItem(item.id, 'prize_rate', e.target.value)}
                  placeholder="Prize Rate"
                />
                <Button onClick={() => handleDeleteItem(selectedSlot.slot_number, item.id)}>Delete</Button>
              </ItemRow>
            ))}
            <AddItemButton onClick={handleAddItem}>Add New Item</AddItemButton>
            <Button type="submit">Update Items</Button>
          </EditForm>
        </EditPanel>
      )}
      {selectedStyle && (
        <EditPanel>
          <h3>Edit Style for Slot {selectedStyle.slot_number}</h3>
          <EditForm onSubmit={handleUpdateStyle}>
            <EditInput
              type="text"
              value={selectedStyle.group_name}
              onChange={(e) => setSelectedStyle({ ...selectedStyle, group_name: e.target.value })}
              placeholder="Group Name"
            />
            <ColorDisplay color={selectedStyle.background_color} />
            <EditInput
              type="color"
              value={selectedStyle.background_color}
              onChange={(e) => setSelectedStyle({ ...selectedStyle, background_color: e.target.value })}
              placeholder="Background Color"
            />
            <ColorDisplay color={selectedStyle.text_color} />
            <EditInput
              type="color"
              value={selectedStyle.text_color}
              onChange={(e) => setSelectedStyle({ ...selectedStyle, text_color: e.target.value })}
              placeholder="Text Color"
            />
            <Button type="submit">Update Style</Button>
          </EditForm>
        </EditPanel>
      )}
    </Container>
  );
};

export default WheelManagement;
