import React, { Component } from 'react';
import './celebritychart.css';

class CelebrityChart extends Component {

    state = {
      co2Data: [],
      loading: true,
    };
 

  componentDidMount() {
    // List of celebrity names
    const celebrities = ['TAYLOR_SWIFT', 'DRAKE', 'TRAVIS_SCOTT', 'JAY_Z', 'OPRAH', 'DR_PHIL', 'JIM_CARREY', 'TOM_CRUISE'];

    // For each celebrity, fetch their CO2 data
    this.fetchCelebrityData(celebrities);
  }

  fetchCelebrityData = async (celebrities) => {
    const co2Data = [];

    // Use Promise.all to wait for all fetch requests to resolve
    await Promise.all(
      celebrities.map(async (celebrity) => {
        try {
          // Dynamically fetch for each celebrity
          const response = await fetch(`http://localhost:3000/carbon-footprint/${celebrity}`);
          const data = await response.json();

          // Ensure data.totalEmissions is a number and push it to the array
          co2Data.push({
            celebrity: celebrity.replace('_', ' '), // Clean name (replace underscores)
            totalEmissions: parseFloat(data.totalEmissions) || 0, // Parse totalEmissions
          });
        } catch (error) {
          console.error(`Error fetching data for ${celebrity}:`, error);
        }
      })
    );

    console.log(co2Data);


    // Update the state after fetching all data
    this.setState({ co2Data, loading: false });
  };

  render() {
    const { co2Data, loading } = this.state;

    if (loading) {
      return <div>Loading...</div>; // Show loading message while fetching data
    }

    // Ensure there is at least one value in the array before using Math.max
    const maxCO2 = co2Data.length > 0 ? Math.max(...co2Data.map(item => item.totalEmissions)) : 1;

    return (
      <div className="bar-chart">
        {co2Data.map((item, index) => (
          <div className="bar" key={index}>
            <span className="label">{`${item.totalEmissions} · ${item.celebrity}`}</span>
            <div
              className="bar-fill"
              style={{ width: `${(item.totalEmissions / maxCO2) * 100}%` }}
            ></div>
          </div>
        ))}
      </div>
    );
  }
}

export default CelebrityChart;
