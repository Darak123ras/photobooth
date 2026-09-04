import React from "react";
import "./LandingPage.css";

const LandingPage = ({ onStart }) => {
  return (
    <div className="landing-wrapper">

      <div className="landing-decoration decoration-one">
        ✦
      </div>

      <div className="landing-decoration decoration-two">
        ♡
      </div>

      <div className="landing-decoration decoration-three">
        ✿
      </div>

      <div className="landing-card">

        <div className="logo-wrapper">
          <span className="logo">📸</span>
        </div>

        <p className="eyebrow">
          YOUR LITTLE PHOTO STUDIO
        </p>

        <h1 className="title">
          Let's Take a Picture
          <span>Together ♡</span>
        </h1>

        <p className="subtitle">
          Snap cute moments, build your own collage,
          decorate it, and save the memory.
        </p>

        <button
          className="start-btn"
          onClick={onStart}
        >
          <span>Start Photobooth</span>
          <span className="start-arrow">→</span>
        </button>

        <p className="landing-note">
          No signup · No uploads · Just you and your camera
        </p>

      </div>
    </div>
  );
};

export default LandingPage;