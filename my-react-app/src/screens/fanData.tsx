import React, { useState, useEffect } from 'react';
import './FanData.css';

const FanData: React.FC = () => {
  const [fanData, setFanData] = useState<{ [celebrity: string]: { mostPopularProduct: string, totalSteps: string } } | null>(null);

  useEffect(() => {
    const fetchFanData = async () => {
      try {
        const response = await fetch('http://localhost:3007/api/fan-data');
        const data = await response.json();
        setFanData(data);
      } catch (error) {
        console.error('Error fetching fan data:', error);
      }
    };
    fetchFanData();
  }, []);

  return (
    <div className="fan-container">
      <h1>🌟 Fan Data for Celebrities 🌟</h1>
      <div className="description">
        Here, you can explore how fans are interacting with their favorite celebrities' products, and see how many steps they've taken to reduce CO2 emissions.
      </div>
      {/* If no data is available, show "No Data Available :(" */}
      {fanData === null ? (
        <p className="no-data">⏳ Loading...</p>
      ) : Object.keys(fanData).length === 0 ? (
        <p className="no-data">❌ No Data Available :(</p>
      ) : (
        <div>
          {Object.entries(fanData).map(([celebrity, data]) => (
            <div key={celebrity} className="data-section">
              <h2>🎤 {celebrity}</h2>
              <p><strong>🔥 Most Popular Product:</strong> {data.mostPopularProduct}</p>
              <p><strong>🚶‍♂️ Total Steps by Fanbase:</strong> {data.totalSteps}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FanData;
