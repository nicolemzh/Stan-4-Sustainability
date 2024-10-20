import { useState } from 'react'
import logo from '../assets/logo.png'
import title from '../assets/title.png'
import CelebrityChart from '../components/celebritychart.tsx'
import './home.css' 


function Home() {
  return (
    <>
    <div className = "main">
        <div className="intro">
            <div className="text">
                <img src={title} height={250} width={650}/>
                <h2 className="motto">celebrities' actions.</h2>
                <div className="typewriter">
                    <h2 className="motto">your impact.</h2>
                </div>
            </div>
            <div className="logo">
                <img src={logo} height={700} width={700}/>
            </div>
        </div>
        <div className = "charts">
            <div className = "celebrities">
                <CelebrityChart />
            </div>
            <div className = "fanbase">

            </div>
        </div>
        <div className = "input">

        </div>
    </div>
    </>
  )
}

export default Home
