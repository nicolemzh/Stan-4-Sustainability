import React from 'react';
import './about.css'; // Link to your CSS file

const About = () => {
    return ( 
        <div className="about-container">
            <h1 className="about-title">About Stan 4 Sustainability</h1>
            <p>
                Welcome to <strong>Stan 4 Sustainability</strong>, the app that lets you
                <em> help offset your favorite celebrity's carbon footprint</em> from their private jets and lavish lifestyles! 
                We're on a mission to turn the passion of being a fan into real-world action for the environment.
            </p>

            <h2 className="about-h2">Join Us in Making a Difference!</h2>
            <p>
                With our app, you can help balance out your favorite artist's carbon emissions by taking everyday eco-friendly actions like:
            </p>
            <ul>
                <li><strong> - Recycling food waste</strong></li>
                <li><strong>- Reducing gas usage</strong> by choosing eco-friendly transportation, such as public transit, biking, or carpooling</li>
            </ul>

            <h2 className="about-h2">It's Easy to Get Started:</h2>
            <ol>
                <li>1. Navigate to the home screen.</li>
                <li>2. Select "Help Offset Your Celebrity's Footprint".</li>
                <li>3. Choose your favorite celebrity and how you want to <strong>offset their emissions</strong>.</li>
                <li>4. Follow the instructions that pop up based on your chosen activity. You'll be able to track your contribution and see how your efforts help in real-time through our data dashboard!</li>
            </ol>

            <h2 className="about-h2">Incentive: Win Concert Tickets!</h2>
            <p>
                To make it even more exciting, the celebrity with the biggest fan base reducing emissions will have their fans entered into a <strong>raffle</strong> to win 
                <strong> concert tickets</strong> for that artist. The more you participate, the higher your chances of winning!
            </p>

            <p>
                So whether you're recycling or cutting down on gas usage, every action counts. <strong>Stan smart, stan sustainably</strong> with us today, and let's make a change together!
            </p>
        </div>
    );
};

export default About;