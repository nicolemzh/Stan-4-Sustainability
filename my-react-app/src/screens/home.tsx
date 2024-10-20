import { useState } from "react";
import logo from "../assets/logo.png";
import celebrities1 from "../assets/celebrities_1.jpg";
import celebrities2 from "../assets/celebrities_2.jpg";
import celebrities3 from "../assets/celebrities_3.jpg";
import celebrities4 from "../assets/celebrities_4.jpg";
import title from "../assets/title.png";
import CelebrityChart from "../components/celebritychart.tsx";
import FanSubmissionForm from "../components/fansubmissionform.tsx";
import "./home.css";
import Marquee from "../components/ui/marquee";

function Home() {
  return (
    <>
      <div className="main w-full">
        <div className="intro grid grid-cols-2">
          <div className="text">
            <img src={title} height={250} width={650} />
            <h2 className="motto">celebrities' actions.</h2>
            <div className="typewriter">
              <h2 className="motto">your impact.</h2>
            </div>
          </div>
          <Marquee
            className="h-64 w-96.25 ml-28 overflow-hidden [--duration:45s] [--gap:1rem]"
            vertical
            style={{
              transform:
                "translateX(0px) translateY(0px) translateZ(-50px) rotateX(0deg) scale(1.5)",
            }}
          >
            <img src={celebrities1} height={600} width={600} />
            <img src={celebrities2} height={600} width={600} />
            <img src={celebrities3} height={600} width={600} />
            <img src={celebrities4} height={600} width={600} />
          </Marquee>
        </div>
      </div>
      <div className="flex flex-col gap-2 py-8 justify-center items-center">
        <div className="charts">
          <div className="celebrities">
            <h1 style={{ color: "black", fontSize: "40px" }}>
              CO2 Emissions (kg) from Celebrity Jets
            </h1>
            <CelebrityChart />
          </div>
          <div className="fanbase"></div>
        </div>
        <div className="input">
          <FanSubmissionForm />
        </div>
      </div>
    </>
  );
}

export default Home;
