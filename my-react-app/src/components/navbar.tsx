import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'
import './navbar.css' 


const NavBar = () => {
    
    return (
        <div className = "nav">
            <Link to="/home">
                <img className="logo" src={logo} width={75} height={75} style={{borderRadius: '50%', objectFit: 'cover', cursor: 'pointer',}}/>
            </Link>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '35px' }}>
                <Stack  direction="row" spacing={2}>
                    <Button variant="contained" color="success" component={Link} to="/home" max-height={1} sx={{'&:hover': {color: '#8B4513',},}}>Home</Button>
                    <Button variant="contained" color="success" component={Link} to="/about" max-height={20} sx={{'&:hover': {color: '#8B4513',},}}>About</Button>
                    <Button variant="contained" color="success" component={Link} to="/fanData" max-height={20} sx={{'&:hover': {color: '#8B4513',},}}>Fan Data</Button>
                </Stack>
            </div>
        </div>
    )
}

export default NavBar