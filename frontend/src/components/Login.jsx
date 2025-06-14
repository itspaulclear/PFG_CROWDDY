import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import './Login.css';
import SliderCard from './SliderCard.jsx';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [isAdmin, setIsAdmin] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login";

    const cargarUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:8080/method/get');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        setUsuarios(data);
        
      } catch (error) {
        console.error('Error al cargar usuarios:', error.message);
        setError(`No se pudo cargar la lista de usuarios. Detalles: ${error.message}`);
      }
    };
    cargarUsuarios();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (usuarios.length > 0) {
        const adminUser = usuarios.find(user => user.id == 1)
        if (adminUser) {
          try {
            if (username === adminUser.username) {
              const passwordMatch = await bcrypt.compare(password, adminUser.password);
              setIsAdmin(passwordMatch);
            } else {
              setIsAdmin(false);
            }
          } catch (error) {
            console.error('Error comparing admin password:', error);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [username, password, usuarios]); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      if (usuarios.length === 0) {
        setError('No se han cargado los usuarios.');
        setLoading(false);
        return;
      }
  
      const user = usuarios.find(user => user.username === username);
      if (!user) {
        setError('Usuario o contraseña incorrectos.');
        setLoading(false);
        return;
      }

      const isAdminUser = user.role === 'admin';
      
      const credencialesValidas = await bcrypt.compare(password, user.password);
      if (!credencialesValidas) {
        setError('Usuario o contraseña incorrectos.');
        setLoading(false);
        return;
      }
  
      localStorage.setItem('token', 'usuario-autenticado-' + Date.now());
      localStorage.setItem('username', user.username);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role || 'user');
  
      if (user && user.username === username) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('username', username);
          localStorage.setItem('isAdmin', user.isAdmin === 1);
          setLoading(false);
          if (user.isAdmin === 1) {
            navigate('/administrator');
          } else {
            navigate('/welcome', { state: { username } });
          }
        } else {
          setError('Contraseña incorrecta');
          setLoading(false);
        }
      } else {
        setError('Error al intentar iniciar sesión. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      setError('Error al intentar iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div id="video-container">
        <video autoPlay muted loop id="background-video">
          <source src="./login/background-video.mp4" type="video/mp4" />
        </video>
      </div>
      <header id="header">
        <Link to="/explore"><p>Explorar</p></Link>
        <Link to="/testimonies"><p>Testimonios</p></Link>
        <Link to="/contact"><p>Contacto</p></Link>
      </header>
      <div className='form-container'>
        <h2>Crowddy</h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        <form onSubmit={handleLogin} className='form'>
          <div>
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
          <div>
            <Link to="/sign-up" id="register"><p>Únete a nuestra comunidad</p></Link>
          </div>
        </form>
      </div>
      <SliderCard />
      <footer id="footer">
        <img src="./src/assets/Crowddy_logo.png" alt="Crowddy" width="80" />
      </footer>
      {isAdmin && (
        <div className="admin-message">
          <Link to="/administrator"><p>Accede como administrador</p></Link>
        </div>
      )}
    </>
  );
};

export default Login;
