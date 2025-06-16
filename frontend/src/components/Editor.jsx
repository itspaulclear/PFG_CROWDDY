import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Editor.css';

function Editor() {
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (!password) return ''; 
    
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'La contraseña debe contener al menos un carácter especial (ej: !@#$%^&*)';
    }
    
    return ''; 
  };

  useEffect(() => {
    const userData = localStorage.getItem('userToEdit');
    if (userData) {
      setUser(JSON.parse(userData));  
    } else {
      console.error('No se encontraron datos del usuario en localStorage.');
      navigate('/administrator');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => {
      const newUser = [...prevUser];
      const fieldMap = {
        'username': 9,
        'password': 7,
        'name': 6,
        'surname': 8,
        'birthDate': 2,
        'interests': 10
      };
      
      if (fieldMap[name] !== undefined) {
        newUser[fieldMap[name]] = value;
      }
      
      return newUser;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    if (user[7]) {
      const error = validatePassword(user[7]);
      if (error) {
        setPasswordError(error);
        return;
      }
    }
    
    setIsSaving(true);
    
    try {
      if (!user[0]) {
        throw new Error('No se pudo identificar el ID del usuario');
      }
      
      let interests = [];
      if (user[10]) {
        if (typeof user[10] === 'string') {
          interests = user[10].split(',').map(item => item.trim());
        } else if (Array.isArray(user[10])) {
          interests = user[10];
        } else {
          interests = String(user[10]).split(',').map(item => item.trim());
        }
      }
      
      const userData = {
        id: user[0],
        username: user[9],
        name: user[6],
        surname: user[8],
        birthday: user[2],
        interests: interests
      };
      
      if (user[7]) {
        userData.password = user[7];
      }
      
      const updateUrl = `http://localhost:8080/method/update-profile/${user[0]}`;
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el usuario');
      }
      
      const updatedUser = await response.json();
      toast.success('Usuario actualizado correctamente');
      
      localStorage.setItem('userToEdit', JSON.stringify(user));
      
      setTimeout(() => {
        navigate('/administrator');
      }, 1500);
      
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      toast.error(error.message || 'Error al actualizar el usuario');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <p>Cargando...</p>;
  }

  return (
    <>
    <Link to="/administrator"><button className="editor-back-button">Regresar</button></Link>
    <div className="editor-content">
      <h2>Editor de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div className="editor-input">
          <label>Nombre de Usuario:</label>
          <input 
            type="text" 
            name="username" 
            value={user[9] || ''} 
            onChange={handleChange}
          />
        </div>
        <div className="editor-input">
          <label>Contraseña:</label>
          <div className="password-container">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              value={user[7] || ''} 
              onChange={(e) => {
                handleChange(e);
                setPasswordError(validatePassword(e.target.value));
              }}
              className="password-input"
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {passwordError && (
              <div className="password-tooltip">
                {passwordError}
              </div>
            )}
          </div>
        </div>
        <div className="editor-input">
          <label>Nombre:</label>
          <input 
            type="text" 
            name="name" 
            value={user[6] || ''} 
            onChange={handleChange}
          />
        </div>
        <div className="editor-input">
          <label>Apellidos:</label>
          <input 
            type="text" 
            name="surname" 
            value={user[8] || ''} 
            onChange={handleChange}
          />
        </div>
        <div className="editor-input">
          <label>Fecha de Nacimiento:</label>
          <input 
            type="date" 
            name="birthDate" 
            value={user[2] || ''} 
            onChange={handleChange}
          />
        </div>
        <div className="editor-input">
          <label>Intereses:</label>
          <input 
            type="text" 
            name="interests" 
            value={user[10] || ''} 
            onChange={handleChange}
            placeholder="Separados por comas (ej: música, deportes, lectura)"
          />
        </div>
        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
    </>
  );
}

export default Editor;
