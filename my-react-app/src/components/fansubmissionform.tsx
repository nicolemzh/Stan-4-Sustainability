import * as React from 'react';
// import { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import axios from 'axios';
import Confetti from 'react-confetti';

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

function TransportationModal({ onClose, celebrity, updateChart }) {
  const [transportationMode, setTransportationMode] = React.useState('');
  const [inputValue, setInputValue] = React.useState('');
  const [contributionMessage, setContributionMessage] = React.useState('');
  const [showConfetti, setShowConfetti] = React.useState(false);

  const handleSubmit = async () => {
    try {
      const requestData = {
        celebrity,
        mode: transportationMode,
        distanceOrSteps: inputValue
      };

      console.log('Submitting request:', requestData);

      // Make the API call to save data
      const response = await axios.post(`http://localhost:3005/save_transportation/${transportationMode}/${inputValue}/${celebrity}`, requestData);

      // Assuming response.data contains { co2Saved, totalEmissionsForCelebrity, totalEmissions }
      const { co2Saved, totalEmissionsForCelebrity, totalEmissions } = response.data;

      // Update the contribution message based on the response
      setContributionMessage(`🎉 Congrats! You saved ${co2Saved.toFixed(2)} kg CO2! ${celebrity}'s total emissions are now ${totalEmissionsForCelebrity.toFixed(2)} kg, and the total saved emissions are ${totalEmissions.toFixed(2)} kg! 🌍`);

      // Show confetti on successful submission
      setShowConfetti(true);

      // Hide confetti after 3 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      // Call the updateChart function to update the emissions chart
      if (updateChart) {
        updateChart(); // Ensure the chart updates with the latest data
      }

    } catch (error) {
      console.error('Error submitting transportation data:', error);
    }
  };

  return (
    <>
      {/* Confetti that appears after submission */}
      {showConfetti && <Confetti />}

      <Modal open={true} onClose={onClose} aria-labelledby="transport-modal-title">
        <Box sx={{ ...style, width: 600 }}>
          <h2 id="transport-modal-title">Sustainable Transportation</h2>

          {/* Select Mode of Transport */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="transport-mode-label">Transport Mode</InputLabel>
            <Select
              labelId="transport-mode-label"
              value={transportationMode}
              onChange={(e) => setTransportationMode(e.target.value)}
            >
              <MenuItem value="steps">Steps</MenuItem>
              <MenuItem value="public transport">Public Transport</MenuItem>
              <MenuItem value="bike">Bike</MenuItem>
            </Select>
          </FormControl>

          {/* Input Field for Steps or Distance */}
          <TextField
            label={transportationMode === 'steps' ? 'Enter number of steps' : 'Enter distance in km'}
            fullWidth
            margin="normal"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          {/* Submit Button */}
          <Button onClick={handleSubmit} sx={{ mt: 2 }}>
            Submit
          </Button>

          {/* Show Contribution Message After Submission */}
          {contributionMessage && (
            <Box mt={2}>
              <p>{contributionMessage}</p>
            </Box>
          )}

          {/* Close Button */}
          <Button onClick={onClose} sx={{ mt: 2, backgroundColor: 'green', color: 'white', '&:hover': { backgroundColor: 'darkgreen' } }}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
}

function FoodWasteModal({ onClose, celebrity }) {
  const [barcode, setBarcode] = React.useState('');
  const [contributionMessage, setContributionMessage] = React.useState(''); // State for contribution message
  const [showConfetti, setShowConfetti] = React.useState(false);


  const handleSubmit = async () => {
    try {
      // Log to ensure the submission is triggered
      console.log(`Submitting barcode: ${barcode} for celebrity: ${celebrity}`);

      // Make the API call to get emissions data
      const response = await axios.get(`http://localhost:3003/calculate_emissions/${barcode}/${celebrity}`);
      console.log('API response:', response.data);

      // Extract relevant data from the response
      const { carbon_emission, celebrity_total_emissions, product_name } = response.data;

      // Set the contribution message based on API response
      setContributionMessage(`🎉 Congrats! 🎉 You saved ${carbon_emission.toFixed(2)} kg CO2 from ${product_name}. Now ${celebrity}'s fanbase has offsetted a total of ${celebrity_total_emissions.toFixed(2)} kg CO2! 🌍`);
      
      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting food waste data:', error);
    }
  };

  return (
    <Modal open={true} onClose={onClose} aria-labelledby="food-waste-modal-title">
      <Box sx={{ ...style, width: 500 }}>
        <h2 id="food-waste-modal-title">Sustainable Food Waste</h2>
        
        {/* Barcode Input */}
        <TextField
          label="Product Barcode"
          fullWidth
          margin="normal"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />

        {/* Submit Button */}
        <Button onClick={handleSubmit} sx={{ mt: 2 }}>
          Submit
        </Button>

        {showConfetti && ( <Confetti/> )}


        {/* Show Contribution Message After Submission */}
        {contributionMessage && (
          <Box mt={2}>
            <p>{contributionMessage}</p>
          </Box>
        )}

        {/* Close Button */}
        <Button onClick={onClose} sx={{ mt: 2, backgroundColor: 'green', color: 'white', '&:hover': { backgroundColor: 'darkgreen' } }}>
          Close
        </Button>
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
    if (e.target.value === 'transportation') {
      setChildModal('transportation');
    } else if (e.target.value === 'food-waste') {
      setChildModal('food-waste');
    }
  };

  const closeChildModal = () => setChildModal(null);

  return (
    <div>
      <Button
        onClick={handleOpen}
        sx={{ backgroundColor: 'green', color: 'white', '&:hover': { backgroundColor: 'darkgreen' } }}
      >
        Help offset your celebrity's footprint!
      </Button>

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
              <MenuItem value="Taylor Swift">Taylor Swift</MenuItem>
               <MenuItem value="Drake">Drake</MenuItem>
               <MenuItem value="Jim Carrey">Jim Carrey</MenuItem>
               <MenuItem value="Tom Cruise">Tom Cruise</MenuItem>
               <MenuItem value="Travis Scott">Travis Scott</MenuItem>
               <MenuItem value="Oprah">Oprah</MenuItem>
               <MenuItem value="Dr. Phil">Dr. Phil</MenuItem>
               <MenuItem value="Jay Z">Jay Z</MenuItem>
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

      {childModal === 'food-waste' && <FoodWasteModal celebrity={celebrity} onClose={closeChildModal} />}
      {childModal === 'transportation' && <TransportationModal celebrity={celebrity} onClose={closeChildModal} />}
    </div>
  );
}
