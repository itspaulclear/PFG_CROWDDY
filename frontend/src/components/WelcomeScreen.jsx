import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CircularText from '../TextAnimations/CircularText/CircularText.tsx';
import './WelcomeScreen.css';


const WelcomeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || 'Usuario';

  const handleAnimationComplete = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-container">
      <div className="circular-text">
        <CircularText
          text="CROWDDY **** CROWDDY **** "
          onHover="speedUp"
          spinDuration={20}
          className="custom-class"
        />
      </div>
      <div className="welcome-screen">
        <p>Iniciando sesión, @{username}</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
