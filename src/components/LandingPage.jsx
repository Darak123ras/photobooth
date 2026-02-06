import React from "react";
import "./LandingPage.css";
const LandingPage = ({ onStart }) => {
  return (
    <div className="landing-container">
      <h1 className="title">📸 Let's Take a Picture Together!</h1>

      <p className="subtitle">
        Turn your moment into a memory in just one click.
      </p>

      <button className="start-btn" onClick={onStart}>
        Start the Photobooth
      </button>
    </div>
  );
};

export default LandingPage;
