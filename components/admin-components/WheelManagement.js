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

const Select = styled.select`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const FilterContainer = styled.div`
  margin-bottom: 10px;
`;

const AddItemButton = styled(Button)`
  background-color: #008CBA;
  margin-top: 10px;
`;

const Message = styled.div`
  margin-top: 20px;
  padding: 10px;
  color: white;
  background-color: ${(props) => (props.type === 'error' ? '#ff4d4f' : '#52c41a')};
  border-radius: 5px;
  text-align: center;
`;

const WheelManagement = () => {
  const [wheelSlots, setWheelSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState(null);
  const [vatPhamList, setVatPhamList] = useState([]);
  const [filteredVatPhamList, setFilteredVatPhamList] = useState([]);
  const [selectedPhanLoai, setSelectedPhanLoai] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const groupsResponse = await fetch('/api/admin/wheel-slot-groups', { headers });
        const groups = await groupsResponse.json();

        if (Array.isArray(groups)) {
          const slotsResponse = await fetch('/api/admin/wheel-slots', { headers });
          const slots = await slotsResponse.json();

          if (Array.isArray(slots)) {
            const groupedSlots = groups.map(group => ({
              ...group,
              items: slots.filter(slot => slot.slot_number === group.slot_number),
            }));

            setWheelSlots(groupedSlots);
          }
        }

        const vatPhamResponse = await fetch('/api/admin/vat-pham', { headers });
        const vatPhamData = await vatPhamResponse.json();
        setVatPhamList(vatPhamData);
        setFilteredVatPhamList(vatPhamData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
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
      lower_bound: '',
      higher_bound: '',
      item_id: null,
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

  const handlePhanLoaiChange = (e) => {
    const phanLoai = e.target.value;
    setSelectedPhanLoai(phanLoai);

    if (phanLoai) {
      const filteredItems = vatPhamList.filter(item => item.phan_loai === parseInt(phanLoai, 10));
      setFilteredVatPhamList(filteredItems);
    } else {
      setFilteredVatPhamList(vatPhamList);
    }
  };

  const handleVatPhamSelect = (itemId, value) => {
    const selectedVatPham = vatPhamList.find(item => item.ID === parseInt(value, 10));

    if (!selectedVatPham) {
      console.error(`Item with ID ${value} not found in vatPhamList`);
      return;
    }

    const updatedItems = selectedSlot.items.map(item =>
      item.id === itemId ? { ...item, option_text: selectedVatPham.Name, item_id: selectedVatPham.ID } : item
    );

    setSelectedSlot({ ...selectedSlot, items: updatedItems });
  };

  const handleUpdateItems = async (e) => {
    e.preventDefault();
  
    const updatedSlot = {
      slot_number: selectedSlot.slot_number,
      items: selectedSlot.items.map(item => ({
        id: item.id,
        option_text: item.option_text,
        prize_rate: item.prize_rate,
        lower_bound: item.lower_bound,
        higher_bound: item.higher_bound,
        item_id: item.item_id,
      })),
    };
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/wheel-slots/${selectedSlot.slot_number}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSlot),
      });
  
      if (!response.ok) {
        setMessage({ type: 'error', text: 'Failed to update slot' });
        return;
      }
  
      setMessage({ type: 'success', text: 'Slot updated successfully' });
      setWheelSlots(wheelSlots.map(slot =>
        slot.slot_number === selectedSlot.slot_number ? updatedSlot : slot
      ));
      setSelectedSlot(null);  
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update slot' });
      console.error('Error updating slot:', error);
    }
  };
  

  const handleUpdateStyle = async (e) => {
    e.preventDefault();

    const updatedStyle = {};

    if (selectedStyle.slot_number) updatedStyle.slot_number = selectedStyle.slot_number;
    if (selectedStyle.group_name) updatedStyle.group_name = selectedStyle.group_name;
    if (selectedStyle.background_color) updatedStyle.background_color = selectedStyle.background_color;
    if (selectedStyle.text_color) updatedStyle.text_color = selectedStyle.text_color;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/wheel-slot-groups/${selectedStyle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedStyle),
      });

      if (!response.ok) {
        setMessage({ type: 'error', text: 'Failed to update style' });
        return;
      }

      setMessage({ type: 'success', text: 'Style updated successfully' });
      setWheelSlots(wheelSlots.map(slot =>
        slot.slot_number === selectedStyle.slot_number ? selectedStyle : slot
      ));
      setSelectedStyle(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update style' });
      console.error('Error updating style:', error);
    }
  };

  const handleSpinClick = () => {
    const newPrizeNumber = Math.floor(Math.random() * wheelSlots.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const calculatePrize = (slot) => {
    if (!slot) {
      return 'Error: Slot data missing';
    }

    if (slot.prize_type === 1) {
      const itemWithBounds = slot.items.find(item => item.lower_bound !== undefined && item.higher_bound !== undefined);

      if (itemWithBounds) {
        const min = itemWithBounds.lower_bound;
        const max = itemWithBounds.higher_bound;

        if (min !== null && max !== null && min <= max) {
          return Math.floor(Math.random() (max - min + 1)) + min;
        } else {
          return 'Invalid Range';
        }
      } else {
        return 'Error: Bounds missing';
      }
    } else if (slot.prize_type !== undefined) {
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
    } else {
      return 'Error: prize_type missing';
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    const selectedSlot = wheelSlots[prizeNumber];

    if (selectedSlot) {
      const prizeValue = calculatePrize(selectedSlot);
      setResult(`You won: ${prizeValue}`);
    } else {
      console.error('Selected Slot is undefined');
    }
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
        {message && <Message type={message.type}>{message.text}</Message>}
      </SlotManagementContainer>
      {selectedSlot && (
        <EditPanel>
          <h3>Edit Slot Items for Slot {selectedSlot.slot_number}</h3>
          <EditForm onSubmit={handleUpdateItems}>
            <h4>Items</h4>
            <FilterContainer>
              <label>Filter by Phan Loai: </label>
              <Select value={selectedPhanLoai} onChange={handlePhanLoaiChange}>
                <option value=''>All</option>
                {Array.from(new Set(vatPhamList.map(item => item.phan_loai))).map(phan_loai => (
                  <option key={phan_loai} value={phan_loai}>{phan_loai}</option>
                ))}
              </Select>
            </FilterContainer>
            {selectedSlot.items.map(item => (
              <ItemRow key={item.id}>
                <Select
                  value={item.option_text}
                  onChange={(e) => handleVatPhamSelect(item.id, e.target.value)}
                >
                  <option value=''>Select Vat Pham</option>
                  {filteredVatPhamList.map(vatPham => (
                    <option key={vatPham.ID} value={vatPham.ID}>{vatPham.Name}</option>
                  ))}
                </Select>
                <EditInput
                  type="text"
                  value={item.option_text}
                  onChange={(e) => handleChangeItem(item.id, 'option_text', e.target.value)}
                  placeholder="Option Text"
                />
                {selectedSlot.prize_type === 1 && (
                  <>
                    <EditInput
                      type="number"
                      value={item.lower_bound}
                      onChange={(e) => handleChangeItem(item.id, 'lower_bound', e.target.value)}
                      placeholder="Lower Bound"
                    />
                    <EditInput
                      type="number"
                      value={item.higher_bound}
                      onChange={(e) => handleChangeItem(item.id, 'higher_bound', e.target.value)}
                      placeholder="Higher Bound"
                    />
                  </>
                )}
                <EditInput
                  type="number"
                  value={item.prize_rate}
                  onChange={(e) => handleChangeItem(item.id, 'prize_rate', e.target.value)}
                  placeholder="Prize Rate"
                />
                <Button onClick={() => handleDeleteItem(selectedSlot.slot_number, item.id)}>Delete</Button>
              </ItemRow>
            ))}
            <AddItemButton type="button" onClick={handleAddItem}>Add New Item</AddItemButton>
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
            <EditInput
              type="color"
              value={selectedStyle.background_color}
              onChange={(e) => setSelectedStyle({ ...selectedStyle, background_color: e.target.value })}
              placeholder="Background Color"
            />
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
