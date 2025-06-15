import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { toast } from 'sonner';
import axios from 'axios';
import PrivPol from './PrivPol';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [picture, setPicture] = useState('');
  const [bio, setBio] = useState('');
  const [bioCharCount, setBioCharCount] = useState(0);
  const maxBioLength = 1000;
  const [interests, setInterests] = useState('');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [birthdayError, setBirthdayError] = useState('');
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const locationInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const imagePreviewRef = useRef(null);
  
  useEffect(() => {
    if (picture) {
      const img = new Image();
      img.onload = () => {
        setImageError(false);
      };
      img.onerror = () => {
        setImageError(true);
      };
      img.src = picture;
    }
  }, [picture]);
  
  const calculateMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };
  
  const calculateMinDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    return minDate.toISOString().split('T')[0];
  };
  
  const maxDate = calculateMaxDate();
  const minDate = calculateMinDate();
  const [requestedFavours] = useState(0);
  const [doneFavours] = useState(0);
  const [birthday, setBirthday] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Registro";
    
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const searchLocation = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
      );
      
      const suggestions = response.data.map(item => ({
        displayName: item.display_name.split(',').slice(0, 4).join(','), 
        fullAddress: item.display_name,
        lat: item.lat,
        lon: item.lon
      }));
      
      setLocationSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
    }
  };
  
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    searchLocation(value);
  };
  
  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.fullAddress);
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const validateBirthday = (date) => {
    if (!date) return 'La fecha de nacimiento es obligatoria';
    
    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      return 'Debes tener al menos 18 años para registrarte';
    }
    
    return '';
  };

  const validatePassword = (pass) => {
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const isLongEnough = pass.length >= 8;
    
    if (!isLongEnough) return 'La contraseña debe tener al menos 8 caracteres';
    if (!hasUpperCase) return 'La contraseña debe contener al menos una mayúscula';
    if (!hasNumber) return 'La contraseña debe contener al menos un número';
    if (!hasSpecialChar) return 'La contraseña debe contener al menos un carácter especial';
    return '';
  };

  const testBackendConnection = async () => {
    const testUrl = 'http://127.0.0.1:8080';
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'text/plain'
        }
      });
      
      return response.ok;
      
    } catch (error) {
      console.error('Error detallado al conectar con el backend:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return false;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    const birthdayValidation = validateBirthday(birthday);
    if (birthdayValidation) {
      setBirthdayError(birthdayValidation);
      return;
    }

    setLoading(true);
    setError('');
    setPasswordError('');
    setBirthdayError('');

    try {
      const requiredFields = [username, password, name, surname, birthday];
      if (requiredFields.some(field => !field)) {
        setError("Por favor, completa todos los campos obligatorios.");
        setLoading(false);
        return;
      }

      const userData = {
        username: username,
        password: password,
        roleRequest: {
          roleListName: ["USER"]
        },
        name: name,
        surname: surname,
        picture: picture || '',
        bio: bio || '',
        interests: interests || '',
        location: location || '',
        birthday: birthday,
        contacts: []
      };

      const apiUrl = 'http://127.0.0.1:8080/auth/sign-up';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173'
        },
        body: JSON.stringify(userData),
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message || 'Error al registrar el usuario');
        } catch (e) {
          setError(errorText || 'Nombre de usuario ya existente');
        }
        setLoading(false);
        return;
      }

      const data = await response.json().catch(e => ({}));
      
      toast.success('Usuario registrado exitosamente', {
        duration: 1000,
        onAutoClose: () => navigate('/log-in')
      });
      
    } catch (error) {
      console.error('Error en la solicitud:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setError('Error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Tooltip id="password-tooltip" effect="solid" className="password-tooltip" />
      <button className="backButtonRegister" onClick={() => navigate('/log-in')}>
        Regresar
      </button>
      <div className="register-container">
        <h2>Registro de Usuario</h2>
        {error && <p className="general-error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}
        <form onSubmit={handleRegister}>
          <div className="input-container">
            <div className="first-row">
              <input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password} 
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setPassword(newPassword);
                  
                  if (newPassword) {
                    const validation = validatePassword(newPassword);
                    if (validation) {
                      setPasswordError(validation);
                    } else if (confirmPassword && newPassword !== confirmPassword) {
                      setPasswordError('Las contraseñas no coinciden');
                    } else {
                      setPasswordError('');
                    }
                  } else {
                    setPasswordError('');
                  }
                }}
                data-tooltip-id="password-tooltip"
                data-tooltip-content={passwordError}
                data-tooltip-place="top"
                className={passwordError ? 'error' : ''}
                required 
              />
              <input 
                type="password" 
                placeholder="Repetir Contraseña" 
                value={confirmPassword} 
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (password !== e.target.value) {
                    setPasswordError('Las contraseñas no coinciden');
                  } else {
                    setPasswordError('');
                  }
                }}
                data-tooltip-id="password-tooltip"
                data-tooltip-content={passwordError}
                data-tooltip-place="top"
                className={passwordError ? 'error' : ''}
                required 
              />
              <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="text" placeholder="Apellidos" value={surname} onChange={(e) => setSurname(e.target.value)} required />
              <div className="date-input-container">
                <input 
                  type="date" 
                  value={birthday} 
                  onChange={(e) => {
                    setBirthday(e.target.value);
                    if (e.target.value) {
                      setBirthdayError(validateBirthday(e.target.value));
                    } else {
                      setBirthdayError('');
                    }
                  }}
                  max={maxDate}
                  min={minDate}
                  className={birthdayError ? 'error' : ''}
                  title="Fecha de nacimiento"
                  required
                />
                {birthdayError && (
                  <div className="error-tooltip" data-tooltip-content={birthdayError}>
                    <span>!</span>
                  </div>
                )}
              </div>
              <div className="image-url-container">
                <input 
                  type="url" 
                  placeholder="URL de la imagen" 
                  value={picture} 
                  onChange={(e) => setPicture(e.target.value)} 
                  onMouseEnter={() => picture && !imageError && setIsHoveringImage(true)}
                  onMouseLeave={() => setIsHoveringImage(false)}
                  className={imageError ? 'error' : ''}
                  required 
                />
                {isHoveringImage && !imageError && picture && (
                  <div className="image-preview-tooltip">
                    <img 
                      ref={imagePreviewRef}
                      src={picture} 
                      alt="Vista previa" 
                      onError={() => setImageError(true)}
                    />
                  </div>
                )}
                {imageError && picture && (
                  <div className="error-tooltip" data-tooltip-content="No se pudo cargar la imagen">
                    <span>!</span>
                  </div>
                )}
              </div>
            </div>
            <div className="second-row">
              <div className="bio-input-container">
                <textarea 
                  placeholder="Cuéntanos sobre ti..." 
                  value={bio} 
                  onChange={(e) => {
                    if (e.target.value.length <= maxBioLength) {
                      setBio(e.target.value);
                      setBioCharCount(e.target.value.length);
                    }
                  }} 
                  rows="3"
                  required 
                />
                <div className="char-remaining">
                  {maxBioLength - bioCharCount}
                </div>
              </div>
              <input type="text" placeholder="Intereses" value={interests} onChange={(e) => setInterests(e.target.value)} required />
              <div className="location-input-container" ref={locationInputRef}>
                <input 
                  type="text" 
                  placeholder="Ubicación" 
                  value={location} 
                  onChange={handleLocationChange}
                  onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                  required 
                />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="location-suggestions" ref={suggestionsRef}>
                    {locationSuggestions.map((suggestion, index) => (
                      <div 
                        key={index} 
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.displayName}
                      </div>
                    ))}
                  </div>
                )}
                <div className="priv-checkbox-container">
                  <label className="checkbox-label">
                    <input type="checkbox" className="priv-checkbox" required />
                    <span className="checkmark"></span>
                    <span className="checkbox-text">Acepto la <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="privacy-link" onClick={(e) => e.stopPropagation()}>Política de Privacidad</a></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <Tooltip id="password-tooltip" />
      </div>
    </div>
  );
};

export default Register;
