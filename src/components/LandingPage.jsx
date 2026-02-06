import React from "react";
import "./LandingPage.css";

const LandingPage = ({ onStart }) => {
  return (
    <div className="landing-wrapper">
      <div className="landing-card">

        <div className="logo">📸</div>

        <h1 className="title">
          Let's Take a Picture<br />Together
        </h1>

        <p className="subtitle">
          A fun photobooth experience in your browser
        </p>

        <button className="start-btn" onClick={onStart}>
          Start Photobooth
        </button>

        {/* <p className="hint">Press SPACE later to capture</p> */}

      </div>
    </div>
  );
};

export default LandingPage;
