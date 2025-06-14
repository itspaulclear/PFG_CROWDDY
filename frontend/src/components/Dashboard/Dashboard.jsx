
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaTrash, FaSearch, FaBell, FaEnvelope, FaUser, FaUsers, FaHeart, FaRetweet, FaHandHolding, FaHandHoldingHeart } from "react-icons/fa";
import SplitText from "../../TextAnimations/SplitText/SplitText.tsx";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { toast } from "sonner";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedUser, setSelectedUser] = useState({});
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [post, setPost] = useState("");
  const [image, setImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('userPosts');
    return savedPosts ? JSON.parse(savedPosts) : [];
  });
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showConnectedUsers, setShowConnectedUsers] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [charsRemaining, setCharsRemaining] = useState(250);
  const [topUsers, setTopUsers] = useState([]);
  const [postType, setPostType] = useState('ofrecer');
  const [daysRemaining, setDaysRemaining] = useState('');
  const [postFilter, setPostFilter] = useState('todos'); 
  const [acceptedPosts, setAcceptedPosts] = useState(new Set());
  
  const textareaRef = useRef(null);
  const postRefs = useRef({});
  const modalRef = useRef(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('username');
    if (!currentUser) return;

    const TOUR_VERSION = 'v1';
    const tourKey = `tour-shown-${currentUser}-${TOUR_VERSION}`;
    if (localStorage.getItem(tourKey) === 'true') return;
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`tour-shown-${currentUser}-`) && key !== tourKey) {
        localStorage.removeItem(key);
      }
    });
    
    localStorage.setItem(tourKey, 'true');

    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        opacity: 0.85,
        padding: 8,
        stagePadding: 5,
        stageRadius: 0,
        popoverOffset: 10,
        smoothScroll: true,
        allowClose: true,
        doneBtnText: '¡Entendido!',
        closeBtnText: 'Saltar',
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        showButtons: ['next', 'previous', 'close'],
        keyboardControl: true,
        disableActiveInteraction: false,
        popoverClass: 'driverjs-theme',
        onHighlightStarted: (element) => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      driverObj.setSteps([
        {
          element: '.dashboard-header',
          popover: {
            title: '👋 ¡Bienvenido a Crowddy!',
            description: 'Tu comunidad de ayuda altruista. Aquí podrás ofrecer y recibir ayuda de otros vecinos.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '.post-box',
          popover: {
            title: '🔀 Cambia el tipo de publicación',
            description: 'Selecciona entre "Ofrecer ayuda" o "Solicitar ayuda" dependiendo de lo que necesites',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.post-box',
          popover: {
            title: '✍️ Crea tu publicación',
            description: 'Describe detalladamente lo que ofreces o necesitas. ¡Sé claro y específico!',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '.post-box',
          popover: {
            title: '🚀 Publica tu mensaje',
            description: '¡Listo! Haz clic aquí para compartir tu publicación con la comunidad',
            side: 'left',
            align: 'center'
          }
        },
        {
          element: '.sidebar nav',
          popover: {
            title: '📍 Menú de navegación',
            description: 'Explora todas las secciones: tu perfil, mensajes, notificaciones y más',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '.filter-options',
          popover: {
            title: '🔍 Filtra las publicaciones',
            description: 'Encuentra exactamente lo que buscas filtrando por tipo de publicación',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.ranking',
          popover: {
            title: '🏆 Ranking de la comunidad',
            description: 'Conoce a los usuarios más activos y colaborativos de Crowddy',
            side: 'left',
            align: 'start'
          }
        }
      ]);

      driverObj.drive();

      return () => {
        clearTimeout(timer);
        if (driverObj) {
          driverObj.destroy();
        }
      };
    }, 1000);
  }, []);

  useEffect(() => {
    localStorage.setItem('userPosts', JSON.stringify(posts));
    
    const checkPostHeights = () => {
      Object.entries(postRefs.current).forEach(([postId, postElement]) => {
        if (postElement) {
          const height = postElement.offsetHeight;
          if (height > 200) {
            postElement.classList.add('long-message');
          } else {
            postElement.classList.remove('long-message');
          }
        }
      });
    };
    
    const timeoutId = setTimeout(checkPostHeights, 0);
    window.addEventListener('resize', checkPostHeights);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkPostHeights);
    };
  }, [posts]);
  
  useEffect(() => {
    if (selectedImage) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [selectedImage]);

  useEffect(() => {
    if (location.state?.message) {
      const message = location.state.message;
      let messageProcessed = false;
      
      if (!messageProcessed) {
        messageProcessed = true;
        setPost(prevPost => {
          if (prevPost && prevPost.includes(message)) {
            return prevPost;
          }
          return prevPost ? `${prevPost} ${message}` : message;
        });
        
        setCharsRemaining(250 - (post.length + message.length + 1));
        
        window.history.replaceState({}, document.title);
        
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    }
  }, [location.state, post.length]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      navigate("/log-in");
    } else {
      setUsername(storedUsername);
    }
    setConnectedUsers([]);
  }, [navigate]);

  useEffect(() => {
    document.title = "Dashboard";
  
    const cargarUsuarios = async () => {
      try {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) return; 
  
        const response = await fetch('http://localhost:8080/method/get');
        if(!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        setSelectedUser(data.find(user => user.username === storedUsername));
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    }
    
    cargarUsuarios();
    
    const cargarTopUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:8080/method/get');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        
        const usuariosProcesados = data
          .filter(user => user && typeof user === 'object' && user.username)
          .map(user => ({
            ...user,
            rating: user.rating !== undefined && !isNaN(Number(user.rating)) ? Number(user.rating) : 0
          }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        setTopUsers(usuariosProcesados);
      } catch (error) {
        console.error("Error al cargar los usuarios con mejor calificación:", error);
      }
    };
    
    cargarTopUsuarios();
  }, []);


  useEffect(() => {
    const today = new Date();
    const nextUpdate = new Date(today);
    nextUpdate.setDate(today.getDate() + 7);
    
    const diffTime = nextUpdate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysRemaining(diffDays > 0 ? `${diffDays} días` : '¡Actualización disponible!');
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [post]);

  const handleAcceptPost = async (post) => {
    try {
      const currentUser = localStorage.getItem('username');
      const token = localStorage.getItem('token');

      if (post.user === currentUser) {
        return;
      }

      setAcceptedPosts(prev => new Set(prev).add(post.id));

      const isOffer = post.type === 'ofrecer';
      let notificationMessage = '';
      
      if (isOffer) {
        notificationMessage = `${currentUser} ha aceptado tu oferta de ayuda: ${post.text.substring(0, 47)}${post.text.length > 47 ? '...' : ''}`;
      } else {
        notificationMessage = `${currentUser} ha aceptado ayudarte con: ${post.text.substring(0, 47)}${post.text.length > 47 ? '...' : ''}`;
      }
      
      if (!post.user || typeof post.user !== 'string') {
        console.error('Invalid post user:', post.user);
        throw new Error('Usuario inválido para la notificación');
      }

      const baseUrl = 'http://localhost:8080';
      const endpoint = `/api/users/${encodeURIComponent(post.user.trim())}/notifications`;
      const url = `${baseUrl}${endpoint}`;
      
      console.log('Sending notification to URL:', url);
      console.log('Notification message:', notificationMessage);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            message: notificationMessage
          })
        });
        
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
        
        if (!response.ok) {
          console.error('Error response status:', response.status, response.statusText);
          console.error('Error response data:', responseData);
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        console.log('Notification sent successfully:', responseData);
      } catch (error) {
        console.error('Error al enviar la notificación:', error);
        console.error('Error details:', {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
          post: {
            id: post?.id,
            user: post?.user,
            type: post?.type,
            text: post?.text
          },
          currentUser: currentUser
        });
        
        setAcceptedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(post?.id);
          return newSet;
        });
        
        toast.error(`Error al procesar la aceptación: ${error.message || 'Error desconocido'}`, {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#f44336',
            color: 'white',
            border: '1px solid #d32f2f'
          }
        });
      }
      
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.filter(p => p.id !== post.id);
        localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
        return updatedPosts;
      });
      
      toast.success('¡Solicitud aceptada correctamente!', {
        duration: 5000,
        position: 'bottom-left',
      });
      
    } catch (error) {
      console.error('Error al aceptar la publicación:', error);
      console.error('Error details:', {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        post: {
          id: post?.id,
          user: post?.user,
          type: post?.type,
          text: post?.text
        },
        currentUser: currentUser
      });
      
      setAcceptedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post?.id);
        return newSet;
      });
      
      toast.error(`Error al procesar la aceptación: ${error.message || 'Error desconocido'}`, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#f44336',
          color: 'white',
          border: '1px solid #d32f2f'
        }
      });
    }
  };

  const incrementRequestedFavours = async (username) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se pudo verificar la autenticación');
      }
      
      const response = await fetch('http://localhost:8080/api/users/increment-requested-favours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al actualizar el contador de favores solicitados');
      }
      
      const result = await response.json();
      return result.success;
      
    } catch (error) {
      console.error('Error al incrementar favores solicitados:', error);
      return false;
    }
  };

  const handlePost = async () => {
    if (post.trim() !== "" || image) {
      const now = new Date();
      const newPost = {
        id: Date.now(),
        text: post,
        img: image,
        type: postType,
        likes: 0,
        likedBy: [],
        retweets: 0,
        timestamp: now.getTime(),
        date: now.toISOString(),
        user: username,
        postType: postType
      };
      
      if (postType === 'solicitar') {
        const success = await incrementRequestedFavours(username);
        if (!success) {
          console.warn('No se pudo actualizar el contador de favores solicitados');
        }
      }
      
      setPosts([newPost, ...posts]);
      setPost("");
      setImage(null);
      setCharsRemaining(250);
    }
  };

  const decrementRequestedFavours = async (username) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se pudo verificar la autenticación');
      }
      
      const response = await fetch('http://localhost:8080/api/users/decrement-requested-favours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al actualizar el contador de favores solicitados');
      }
      
      const result = await response.json();
      return result.success;
      
    } catch (error) {
      console.error('Error al decrementar favores solicitados:', error);
      return false;
    }
  };

  const handleDelete = async (id) => {
    const postToDelete = posts.find(p => p.id === id);
    
    if (!postToDelete) return;

    if (postToDelete.type === 'solicitar' && postToDelete.user === localStorage.getItem('username')) {
      const success = await decrementRequestedFavours(postToDelete.user);
      if (!success) {
        console.warn('No se pudo actualizar el contador de favores solicitados');
      }
    }

    setPosts(posts.filter((p) => p.id !== id));
    
    toast.success('Publicación eliminada', {
      action: {
        label: 'Deshacer',
        onClick: async () => {
          if (postToDelete.type === 'solicitar' && postToDelete.user === localStorage.getItem('username')) {
            const success = await incrementRequestedFavours(postToDelete.user);
            if (!success) {
              console.warn('No se pudo restaurar el contador de favores solicitados');
            }
          }
          setPosts(prevPosts => [postToDelete, ...prevPosts.filter(p => p.id !== id)]);
        },
      },
      duration: 5000, 
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = (id, postAuthor) => {
    const currentUser = localStorage.getItem('username');
    if (postAuthor === currentUser) {
      return; 
    }
    
    setPosts(posts.map(post => {
      if (post.id !== id) return post;
      
      if (post.likedBy && post.likedBy.includes(currentUser)) {
        return post; 
      }
      
      return {
        ...post,
        likes: post.likes + 1,
        likedBy: [...(post.likedBy || []), currentUser]
      };
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/log-in");
  };

  return (
    <>
      <div className="dashboard">
        <aside className="sidebar">
        <nav>
          <ul>
            <Link to="/expdashboard" className="explore-dashboard">
              <li><FaSearch /> Explorar</li>
            </Link>
            <Link to="/notificationsdashboard" className="notifications-dashboard">
              <li><FaBell /> Notificaciones</li>
            </Link>
            <Link to="/messagesdashboard" className="messages-dashboard">
              <li><FaEnvelope /> Mensajes</li>
            </Link>
            <Link to="/profiledashboard" state={{ selectedUser }} className="profile-dashboard">
              <li><FaUser /> Mi perfil</li>
            </Link>
            <li onClick={() => setShowConnectedUsers(!showConnectedUsers)} style={{ cursor: 'pointer' }}>
              <FaUsers /> Usuarios Conectados ({connectedUsers.length})
            </li>
            {showConnectedUsers && (
              <ul>
                {connectedUsers.map((user, index) => (
                  <li key={index} style={{ paddingLeft: '20px' }}>{user}</li>
                ))}
              </ul>
            )}
            <img src="./src/assets/Crowddy_logo.png" alt="Crowddy" className="logo" />
          </ul>
        </nav>
        </aside>
        <div className="content">
          <header className="dashboard-header">
            {useMemo(() => (
              <SplitText text={`Hola ${username.charAt(0).toUpperCase() + username.slice(1)}`} />
            ), [username])}
            <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
          </header>
          <div className="post-box">
            <div className="post-type-toggle">
              <button 
                className={`toggle-btn ${postType === 'ofrecer' ? 'active' : ''}`}
                onClick={() => setPostType('ofrecer')}
              >
                Ofrecer
              </button>
              <button 
                className={`toggle-btn ${postType === 'solicitar' ? 'active' : ''}`}
                onClick={() => setPostType('solicitar')}
              >
                Solicitar
              </button>
            </div>
          <div className="textarea-container">
            <textarea
              ref={textareaRef}
              value={post}
              placeholder={postType === 'ofrecer' ? '¿Qué ofreces?' : '¿Qué necesitas?'}
              onChange={(e) => {
                if (e.target.value.length <= 250) {
                  setPost(e.target.value);
                  setCharsRemaining(250 - e.target.value.length);
                  setIsTyping(true);
                }
              }}
              onBlur={() => setIsTyping(false)}
              maxLength={250}
            />
            <div className="char-counter">{charsRemaining} caracteres restantes</div>
            <input
              type="file"
              id="file-input"
              className="input-image"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <div
              className={`input-image-custom ${isTyping ? 'transparent-btn' : ''}`}
              onClick={() => document.getElementById('file-input').click()}
            >
              Seleccionar imagen
            </div>
          </div>
          <button onClick={handlePost} className="publish-btn">Publicar</button>
        </div>
        <div className="feed">
          {posts.length === 0 ? (
            <p className="empty-feed">Aún no hay publicaciones.</p>
          ) : (
            posts
              .filter(post => {
                if (postFilter === 'todos') return true;
                if (postFilter === 'solicitudes') return post.postType === 'solicitar';
                if (postFilter === 'ofrecimientos') return post.postType === 'ofrecer';
                return true;
              })
              .map((p) => (
              <div 
                ref={el => postRefs.current[p.id] = el}
                className={`post ${p.postType === 'ofrecer' ? 'offer-post' : 'request-post'}`} 
                key={p.id}
              >
                <button 
                  className="accept-button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcceptPost(p);
                  }}
                  disabled={p.user === username || acceptedPosts.has(p.id)}
                  style={{
                    opacity: (p.user === username || acceptedPosts.has(p.id)) ? 0.5 : 1,
                    cursor: (p.user === username || acceptedPosts.has(p.id)) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {p.user === username ? 'Tú' : acceptedPosts.has(p.id) ? 'Aceptado' : 'Acepto'}
                </button>
                <div className="post-header">
                  <strong>{p.user}</strong>
                  <span className="post-type-indicator">
                    {p.postType === 'ofrecer' ? (
                      <>
                        <FaHandHolding className="offer-icon" />
                        <span className="tooltip">Ofrecimiento</span>
                      </>
                    ) : (
                      <>
                        <FaHandHoldingHeart className="request-icon" />
                        <span className="tooltip">Solicitud</span>
                      </>
                    )}
                  </span>
                  <span className="post-time">
                    {new Date(p.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p>{p.text}</p>
                {p.img && (
                  <img 
                    src={p.img} 
                    alt="Publicación" 
                    className="post-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(p.img);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                <div className="post-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(p.id, p.user);
                    }}
                    disabled={p.user === localStorage.getItem('username') || (p.likedBy && p.likedBy.includes(localStorage.getItem('username')))}
                    style={{ 
                      opacity: (p.user === localStorage.getItem('username') || (p.likedBy && p.likedBy.includes(localStorage.getItem('username')))) ? 0.5 : 1,
                      color: (p.likedBy && p.likedBy.includes(localStorage.getItem('username'))) ? 'red' : 'inherit'
                    }}
                  >
                    <FaHeart /> {p.likes}
                  </button>
                  {p.user === username && (
                    <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                      <FaTrash />
                    </button>
                  )}
                  <div className="post-date">
                    {new Date(p.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <aside className="sidebar ranking" style={{ backgroundColor: '#2e2c81' }}>
          <h2>Ranking de crowddiers</h2>
          <table>
            <thead>
              <tr>
                <th>Posición</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, index) => (
                <tr key={user._id || index}>
                  <td>{index + 1}</td>
                  <td>@{user.username}</td>
                </tr>
              ))}
              {topUsers.length === 0 && (
                <tr>
                  <td colSpan="2">No hay datos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="update-info">
            Próxima actualización en {daysRemaining}
          </div>
        </aside>
      </div>
      <div className="filter-messages">
        <h3>Filtrar publicaciones</h3>
        <div className="filter-options">
          <label className={`filter-option ${postFilter === 'todos' ? 'active' : ''}`}>
            <input 
              type="radio" 
              name="postFilter" 
              value="todos" 
              checked={postFilter === 'todos'}
              onChange={() => setPostFilter('todos')}
            />
            <span>Todas</span>
          </label>
          <label className={`filter-option ${postFilter === 'solicitudes' ? 'active' : ''}`}>
            <input 
              type="radio" 
              name="postFilter" 
              value="solicitudes" 
              checked={postFilter === 'solicitudes'}
              onChange={() => setPostFilter('solicitudes')}
            />
            <span>Solicitudes</span>
          </label>
          <label className={`filter-option ${postFilter === 'ofrecimientos' ? 'active' : ''}`}>
            <input 
              type="radio" 
              name="postFilter" 
              value="ofrecimientos" 
              checked={postFilter === 'ofrecimientos'}
              onChange={() => setPostFilter('ofrecimientos')}
            />
            <span>Se ofrece</span>
          </label>
        </div>
      </div>
      </div>

      {selectedImage && (
        <div 
          className="image-modal-overlay"
          onClick={(e) => {
            if (e.target === modalRef.current) {
              setSelectedImage(null);
            }
          }}
          ref={modalRef}
        >
          <div className="image-modal-content">
            <button 
              className="close-modal"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
            <img 
              src={selectedImage} 
              alt="Vista previa" 
              className="modal-image"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
