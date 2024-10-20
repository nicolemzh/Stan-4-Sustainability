import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

function TransportationModal({ onClose }) {
  const [transportationMode, setTransportationMode] = React.useState('');
  const [inputValue, setInputValue] = React.useState('');

  return (
    <Modal open={true} onClose={onClose} aria-labelledby="transport-modal-title">
      <Box sx={{ ...style, width: 300 }}>
        <h2 id="transport-modal-title">Sustainable Transportation</h2>
        <FormControl fullWidth>
          <InputLabel id="transport-mode-label">Transport Mode</InputLabel>
          <Select
            labelId="transport-mode-label"
            value={transportationMode}
            onChange={(e) => setTransportationMode(e.target.value)}
          >
            <MenuItem value="steps">Steps</MenuItem>
            <MenuItem value="public-transport">Public Transport</MenuItem>
            <MenuItem value="bike">Bike</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Input your data"
          fullWidth
          margin="normal"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button onClick={() => onClose()}>Submit</Button>
      </Box>
    </Modal>
  );
}

function FoodWasteModal({ onClose }) {
  const [qrCode, setQrCode] = React.useState('');

  return (
    <Modal open={true} onClose={onClose} aria-labelledby="food-waste-modal-title">
      <Box sx={{ ...style, width: 300 }}>
        <h2 id="food-waste-modal-title">Sustainable Food Waste</h2>
        <TextField
          label="QR Code"
          fullWidth
          margin="normal"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
        />
        <Button onClick={() => onClose()}>Submit</Button>
      </Box>
    </Modal>
  );
}

export default function NestedModal() {
  const [open, setOpen] = React.useState(false);
  const [childModal, setChildModal] = React.useState(null);
  const [celebrity, setCelebrity] = React.useState('');
  const [category, setCategory] = React.useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    // Open child modal based on selection
    if (e.target.value === 'transportation') {
      setChildModal('transportation');
    } else if (e.target.value === 'food-waste') {
      setChildModal('food-waste');
    }
  };

  const closeChildModal = () => setChildModal(null);

  return (
    <div>
      <Button onClick={handleOpen} sx={{ backgroundColor: 'green', color: 'white', '&:hover': { backgroundColor: 'darkgreen' } }}>Help offset your celebrity's footprint!</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style, width: 400 }}>
          <h2 id="parent-modal-title">Select a Celebrity</h2>
          <FormControl fullWidth margin="normal">
            <InputLabel id="celebrity-label">Celebrity</InputLabel>
            <Select
              labelId="celebrity-label"
              value={celebrity}
              onChange={(e) => setCelebrity(e.target.value)}
            >
              <MenuItem value="TAYLOR_SWIFT">Taylor Swift</MenuItem>
              <MenuItem value="DRAKE">Drake</MenuItem>
              <MenuItem value="JIM_CARREY">Jim Carrey</MenuItem>
              <MenuItem value="TOM_CRUISE">Tom Cruise</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={handleCategoryChange}
            >
              <MenuItem value="transportation">Sustainable Transportation</MenuItem>
              <MenuItem value="food-waste">Sustainable Food Waste</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Modal>

      {/* Conditionally render the child modals */}
      {childModal === 'food-waste' && <FoodWasteModal onClose={closeChildModal} />}
      {childModal === 'transportation' && <TransportationModal onClose={closeChildModal} />}
    </div>
  );
}
 