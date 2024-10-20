import { useState } from 'react'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/home';
import About from './screens/about'; 
import FanData from './screens/fanData'; 
import NavBar from './components/navbar'; 
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/fandata" element={<FanData />} />
        </Routes>
      </Router>
    </div>
    </>
  )
}

export default App
