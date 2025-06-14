import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';
import './Contact.css'

const Contacto = () => {
  return (
    <div className="contacto-body">
        <Link to="/log-in"><button className="contacto-button">Regresar</button></Link>
        <div className="contacto-container">
        <h2>Contacto</h2>
        <p>¡Síguenos a través de nuestras redes sociales!</p>
        
        <div className="social-icons">
            <div className="social-icon-container">
                <FaFacebook size={40} color="#3b5998" className="social-icon" />
                <span className="tooltip">Próximamente</span>
            </div>
            <div className="social-icon-container">
                <FaTwitter size={40} color="#1DA1F2" className="social-icon" />
                <span className="tooltip">Próximamente</span>
            </div>
            <div className="social-icon-container">
                <FaInstagram size={40} color="#E4405F" className="social-icon" />
                <span className="tooltip">Próximamente</span>
            </div>
            <div className="social-icon-container">
                <FaLinkedin size={40} color="#0077B5" className="social-icon" />
                <span className="tooltip">Próximamente</span>
            </div>
        </div>
        </div>
    </div>
  );
};

export default Contacto;
