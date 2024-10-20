import React, { Component } from 'react';
import axios from 'axios';
import './userchart.css';

class UserChart extends Component {
  state = {
    co2Data: [],
  };

  componentDidMount() {
    const users = ['TAYLOR_SWIFT', 'DRAKE', 'TRAVIS_SCOTT', 'JIM_CARREY', 'OPRAH', 'DR_PHIL', 'TOM_CRUISE', 'JAY_Z'];

    this.fetchUserData(users);

    // Polling: fetch data every 5 seconds
    this.intervalId = setInterval(() => {
      this.fetchUserData(users);
    }, 5000);
  }

  componentWillUnmount() {
    // Clear the interval when the component unmounts
    clearInterval(this.intervalId);
  }

  fetchUserData = async (users) => {
    try {
      const response = await axios.get(`http://localhost:3003/total_emissions`);
      const data = response.data;

      console.log('Received data:', data); // Log the data to inspect the structure

      // Call updateChart to update the data for the users
      this.updateChart(users, data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  updateChart = (users, data) => {
    const updatedCo2Data = users.map((user) => {
      // Access the total_emissions for each celebrity in the data
      const userFormatted = user.replace(/\./g, '').replace(' ', '_').toUpperCase();

      // Look up the matching name from the API response
      const matchingUser = Object.keys(data.celebrities).find(
        celeb => celeb.toUpperCase().replace(/\./g, '').replace(' ', '_') === userFormatted
      );

      const totalEmissions = matchingUser ? data.celebrities[matchingUser].total_emissions : 0;


      return {
        user: user.replace('_', ' '), // Clean up the user name
        totalEmissions: parseFloat(totalEmissions) || 0, // Ensure totalEmissions is a number
      };
    });

    // Update the state with the new CO2 data
    this.setState({ co2Data: updatedCo2Data });
  };

  render() {
    const { co2Data } = this.state;

    const maxCO2 = co2Data.length > 0 ? Math.max(...co2Data.map((item) => item.totalEmissions)) : 1;

    return (
      <div className="bar-chart">
        {co2Data.map((item, index) => (
          <div className="bar" key={index}>
            <div
              className="bar-fill-2"
              style={{ width: `${(item.totalEmissions / maxCO2) * 50}%` }}
            ></div>
            <span className="label">{`${item.totalEmissions} · ${item.user}`}</span>
          </div>
        ))}
      </div>
    );
  }
}

export default UserChart;
