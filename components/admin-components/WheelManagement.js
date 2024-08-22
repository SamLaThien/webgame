import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const Container = styled.div`
  padding: 20px;
  background-color: none;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
`;

const GenerateButton = styled(Button)`
  && {
    margin-top: 20px;
    background-color: #93b6c8;
    color: white;
    &:hover {
      background-color: #45a049;
    }
  }
`;

const VatphamContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const GiftCodeManagement = () => {
  const [giftCode, setGiftCode] = useState("");
  const [exp, setExp] = useState(0);
  const [taiSan, setTaiSan] = useState(0);
  const [lifetime, setLifetime] = useState(new Date());
  const [timeCanUse, setTimeCanUse] = useState(1);
  const [vatphams, setVatphams] = useState([]);
  const [selectedVatphams, setSelectedVatphams] = useState([]);
  const [currentVatphamId, setCurrentVatphamId] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [allGiftCodes, setAllGiftCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingGiftCodeId, setEditingGiftCodeId] = useState(null);

  useEffect(() => {
    fetchVatphams();
    fetchGiftCodes();
  }, []);

  const fetchVatphams = () => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/admin/gift-code/vat-pham", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setVatphams(response.data))
      .catch((error) => console.error("Error fetching vatphams:", error));
  };

  const fetchGiftCodes = () => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/admin/gift-code", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAllGiftCodes(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching gift codes:", error);
        setLoading(false);
      });
  };

  const generateGiftCode = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGiftCode(newCode);
  };

  const addVatpham = () => {
    if (currentVatphamId && currentQuantity > 0) {
      setSelectedVatphams([
        ...selectedVatphams,
        { vat_pham_id: currentVatphamId, quantity: currentQuantity },
      ]);
      setCurrentVatphamId("");
      setCurrentQuantity(1);
    }
  };

  const saveGiftCode = () => {
    const token = localStorage.getItem("token");
    const payload = {
      code: giftCode,
      exp,
      tai_san: taiSan,
      lifetime: lifetime.toISOString().slice(0, 19).replace("T", " "),
      vatphams: selectedVatphams,
      time_can_use: timeCanUse,
    };

    const url = editMode
      ? `/api/admin/gift-code?id=${editingGiftCodeId}`
      : "/api/admin/gift-code";
    const method = editMode ? "PUT" : "POST";

    axios({
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: payload,
    })
      .then((response) => {
        setMessage(response.data.message);
        fetchGiftCodes();
        resetForm();
      })
      .catch((error) => console.error("Error:", error));
  };

  const resetForm = () => {
    setGiftCode("");
    setExp(0);
    setTaiSan(0);
    setLifetime(new Date());
    setTimeCanUse(1);
    setSelectedVatphams([]);
    setEditMode(false);
    setEditingGiftCodeId(null);
  };

  const handleEdit = (giftCode) => {
    setGiftCode(giftCode.code);
    setExp(giftCode.exp);
    setTaiSan(giftCode.tai_san);
    setLifetime(new Date(giftCode.lifetime));
    setTimeCanUse(giftCode.time_can_use);
    setSelectedVatphams(giftCode.vatphams || []);
    setEditingGiftCodeId(giftCode.id);
    setEditMode(true);
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`/api/admin/gift-code?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setMessage(response.data.message);
        fetchGiftCodes();
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <Container>
      <Title>Generate Gift Code</Title>
      <TextField
        label="Gift Code"
        value={giftCode}
        fullWidth
        variant="outlined"
        InputProps={{
          readOnly: true,
        }}
        margin="normal"
      />
      <GenerateButton onClick={generateGiftCode}>Generate Code</GenerateButton>

      <TextField
        label="Experience (Exp)"
        value={exp}
        onChange={(e) => setExp(e.target.value)}
        fullWidth
        variant="outlined"
        margin="normal"
      />
      <TextField
        label="Money (Tai San)"
        value={taiSan}
        onChange={(e) => setTaiSan(e.target.value)}
        fullWidth
        variant="outlined"
        margin="normal"
      />
      <TextField
        label="Time Can Use"
        value={timeCanUse}
        onChange={(e) => setTimeCanUse(e.target.value)}
        type="number"
        variant="outlined"
        margin="normal"
      />
      <div style={{ margin: "20px 0" }}>
        <ReactDatePicker
          selected={lifetime}
          onChange={(date) => setLifetime(date)}
          showTimeSelect
          timeFormat="HH:mm:ss"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd HH:mm:ss"
          customInput={
            <TextField fullWidth variant="outlined" margin="normal" />
          }
        />
      </div>

      {selectedVatphams &&
        selectedVatphams.length > 0 &&
        selectedVatphams.map((vatpham, index) => (
          <VatphamContainer key={index}>
            <Typography variant="body1">
              {vatphams.find((vp) => vp.ID === vatpham.vat_pham_id)?.Name}
            </Typography>
            <Typography variant="body1">
              {" "}
              - Quantity: {vatpham.quantity}
            </Typography>
          </VatphamContainer>
        ))}

      <VatphamContainer>
        <FormControl variant="outlined" fullWidth>
          <InputLabel>Vatpham</InputLabel>
          <Select
            label="Vatpham"
            value={currentVatphamId}
            onChange={(e) => setCurrentVatphamId(e.target.value)}
          >
            {vatphams.map((vp) => (
              <MenuItem key={vp.ID} value={vp.ID}>
                {vp.Name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Quantity"
          value={currentQuantity}
          onChange={(e) => setCurrentQuantity(e.target.value)}
          type="number"
          variant="outlined"
          margin="normal"
          style={{ width: "100px", marginLeft: "10px" }}
        />
        <IconButton
          color="primary"
          onClick={addVatpham}
          style={{ marginLeft: "10px" }}
        >
          <AddIcon />
        </IconButton>
      </VatphamContainer>

      {giftCode && (
        <GenerateButton onClick={saveGiftCode}>
          {editMode ? "Update" : "Save"} Code
        </GenerateButton>
      )}
      {message && (
        <Typography color="primary" variant="h6">
          {message}
        </Typography>
      )}

      <Title>All Gift Codes</Title>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Exp</TableCell>
                <TableCell>Tai San</TableCell>
                <TableCell>Lifetime</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Time Can Use</TableCell>
                <TableCell>Vatpham</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allGiftCodes.map((giftCode) => (
                <TableRow key={giftCode.id}>
                  <TableCell>{giftCode.code}</TableCell>
                  <TableCell>{giftCode.exp}</TableCell>
                  <TableCell>{giftCode.tai_san}</TableCell>
                  <TableCell>
                    {new Date(giftCode.lifetime).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {giftCode.active ? "Active" : "Inactive"}
                  </TableCell>
                  <TableCell>{giftCode.time_can_use}</TableCell>
                  <TableCell>
                    {giftCode.vat_pham_names &&
                      giftCode.vat_pham_names
                        .split(",")
                        .map((name, index) => (
                          <div key={index}>{name.trim()}</div>
                        ))}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(giftCode)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(giftCode.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default GiftCodeManagement;
