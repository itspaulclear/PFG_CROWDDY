import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import './ExpDashboard.css';

const ExpDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState();
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosOriginales, setUsuariosOriginales] = useState([]);
  const [contactedUsers, setContactedUsers] = useState(new Set());
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({ name: '', image: '', index: 0 });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [searchType, setSearchType] = useState('usuario');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const savedToast = localStorage.getItem('pendingToast');
    if (savedToast) {
      const { message, type = 'success' } = JSON.parse(savedToast);
      toast[type](message);
      localStorage.removeItem('pendingToast');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.user-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  const handleClick = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const searchOptions = [
    { value: 'usuario', label: 'Usuario' },
    { value: 'localizacion', label: 'Localización' },
    { value: 'intereses', label: 'Intereses' }
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const filtered = filterUsuarios();
    setUsuarios(filtered);
    setCurrentPage(1); 
  }, [searchQuery, searchType]);

  const filterUsuarios = () => {
    if (!searchQuery) return usuariosOriginales;

    return usuariosOriginales.filter(usuario => {
      const query = searchQuery.toLowerCase();
      
      switch (searchType) {
        case 'usuario':
          return (usuario.username || '').toLowerCase().includes(query);
        case 'localizacion':
          return (usuario.location || '').toLowerCase().includes(query);
        case 'intereses':
          const intereses = Array.isArray(usuario.interests) 
            ? usuario.interests.join(',')
            : String(usuario.interests || '');
          return intereses.toLowerCase().includes(query);
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    document.title = "ExpDashboard";
    
    const cargarUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:8080/method/get');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        setUsuarios(data);
        setUsuariosOriginales(data);
      } catch (error) {
        setError(`No se pudo cargar la lista de usuarios. Detalles: ${error.message}`);
      }
    };

    cargarUsuarios();
  }, []);

  useEffect(() => {
    try {
      const storedUserStr = localStorage.getItem('user');
      const storedUsername = localStorage.getItem('username');
      
      if (!storedUsername) {
        navigate('/log-in');
        return;
      }
      
      let userData = null;
      if (storedUserStr) {
        try {
          userData = JSON.parse(storedUserStr);
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.removeItem('user');
          navigate('/log-in');
          return;
        }
      }
      
      setUsername(storedUsername);
      setCurrentUser(userData || { username: storedUsername });
    } catch (error) {
      console.error('Error initializing user:', error);
      navigate('/log-in');
    }
  }, [navigate]);

  const totalPages = Math.ceil(usuarios.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
          disabled={currentPage === i}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        {pages}
        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    );
  };

  const getCurrentPageItems = (filteredUsuarios = usuarios) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsuarios.slice(startIndex, endIndex);
  };

  useEffect(() => {
    document.title = "ExpDashboard";

    const cargarUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:8080/method/get');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        setError(`No se pudo cargar la lista de usuarios. Detalles: ${error.message}`);
      }
    };

    cargarUsuarios();
  }, []);

  const openModal = (imageUrl, name, index) => {
    setSelectedUser({ image: imageUrl, name, index });
    setModalOpen(true);
    setModalInfoOpen(false);
    document.body.style.overflow = 'hidden';
  };

  const openModalInfo = (user) => {
    setSelectedUser({ name: user.username, image: user.picture, index: 0 });
    setModalInfoOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedUser({ name: '', image: '', index: 0 });
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const closeModalInfo = () => {
    setModalInfoOpen(false);
    document.body.style.overflow = 'auto';
  };

  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 'N/A';
    try {
      const [year, month, day] = birthDateString.split('-').map(Number);
      const today = new Date();
      let age = today.getFullYear() - year;
      if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) {
        age--;
      }
      return age;
    } catch (error) {
      console.error('Error al calcular la edad:', error);
      return 'N/A';
    }
  };

  const normalizeContacts = (contacts, allUsers) => {
    if (!Array.isArray(contacts)) return [];
    
    const contactsMap = new Map();
    
    contacts.forEach(contact => {
      if (typeof contact === 'number') {
        const user = allUsers.find(u => u.id === contact);
        if (user) {
          contactsMap.set(user.id, {
            id: user.id,
            username: user.username,
            name: user.name || '',
            surname: user.surname || '',
            picture: user.picture || '',
            bio: user.bio || '',
            interests: Array.isArray(user.interests) ? user.interests : [],
            location: user.location || '',
            requestedFavours: user.requestedFavours || 0,
            doneFavours: user.doneFavours || 0,
            birthday: user.birthday || '',
            accountNoExpired: user.accountNoExpired,
            accountNoLocked: user.accountNoLocked,
            credentialNoExpired: user.credentialNoExpired,
            roles: user.roles || [],
            enabled: user.enabled
          });
        }
      } else if (contact && typeof contact === 'object') {
        contactsMap.set(contact.id, {
          id: contact.id,
          username: contact.username,
          name: contact.name || '',
          surname: contact.surname || '',
          picture: contact.picture || '',
          bio: contact.bio || '',
          interests: Array.isArray(contact.interests) ? contact.interests : [],
          location: contact.location || '',
          requestedFavours: contact.requestedFavours || 0,
          doneFavours: contact.doneFavours || 0,
          birthday: contact.birthday || '',
          accountNoExpired: contact.accountNoExpired,
          accountNoLocked: contact.accountNoLocked,
          credentialNoExpired: contact.credentialNoExpired,
          roles: contact.roles || [],
          enabled: contact.enabled
        });
      }
    });
    
    return Array.from(contactsMap.values());
  };

  useEffect(() => {
    const loadUserContacts = async () => {
      try {
        const currentUsername = localStorage.getItem('username');
        if (!currentUsername) return;
        
        const response = await fetch('http://localhost:8080/method/get');
        if (!response.ok) throw new Error('Error al cargar usuarios');
        
        const allUsers = await response.json();
        
        const currentUser = allUsers.find(u => u.username === currentUsername);
        if (!currentUser) return;
        
        const normalizedContacts = normalizeContacts(currentUser.contacts || [], allUsers);
        
        setContactedUsers(new Set(normalizedContacts.map(c => c.username)));
        
        setUsuarios(prevUsuarios => 
          prevUsuarios.map(user => {
            const contactData = normalizedContacts.find(c => c.username === user.username);
            return contactData ? { ...user, ...contactData } : user;
          })
        );
        
        const contactsData = {};
        normalizedContacts.forEach(contact => {
          contactsData[contact.username] = contact;
        });
        
        localStorage.setItem(`user_${currentUsername}_contacts`, 
          JSON.stringify(normalizedContacts.map(c => c.username)));
        localStorage.setItem(`user_${currentUsername}_contacts_data`, 
          JSON.stringify(contactsData));
          
      } catch (error) {
        console.error('Error al cargar contactos del usuario:', error);
      }
    };
    
    loadUserContacts();
  }, []);

  const handleContact = async (contactUsername, contactData) => {
    try {
      const currentUsername = localStorage.getItem('username');
      if (!currentUsername) {
        throw new Error('No se pudo obtener la información del usuario actual');
      }
      
      if (currentUsername === contactUsername) {
        throw new Error('No puedes agregarte a ti mismo como contacto');
      }

      const userResponse = await fetch('http://localhost:8080/method/get');
      if (!userResponse.ok) {
        throw new Error('Error al cargar los datos del usuario');
      }
      const allUsers = await userResponse.json();
      
      const currentUser = allUsers.find(u => u.username === currentUsername);
      if (!currentUser) {
        throw new Error('Usuario actual no encontrado');
      }
      
      const contactUser = allUsers.find(u => u.username === contactUsername);
      if (!contactUser) {
        throw new Error('Usuario de contacto no encontrado');
      }

      const userCurrentContacts = Array.isArray(currentUser.contacts) ? [...currentUser.contacts] : [];
      
      const contactExists = userCurrentContacts.some(contact => {
        if (typeof contact === 'number') {
          return contact === contactUser.id;
        } else if (contact && typeof contact === 'object') {
          return contact.id === contactUser.id || contact.username === contactUsername;
        }
        return false;
      });
      
      if (contactExists) {
        throw new Error('Este contacto ya está en tu lista');
      }

      const contactToAdd = {
        id: contactUser.id,
        username: contactUser.username,
        name: contactUser.name || '',
        surname: contactUser.surname || '',
        picture: contactUser.picture || '',
        bio: contactUser.bio || '',
        interests: Array.isArray(contactUser.interests) ? contactUser.interests : [],
        location: contactUser.location || '',
        requestedFavours: contactUser.requestedFavours || 0,
        doneFavours: contactUser.doneFavours || 0,
        birthday: contactUser.birthday || '',
        accountNoExpired: contactUser.accountNoExpired,
        accountNoLocked: contactUser.accountNoLocked,
        credentialNoExpired: contactUser.credentialNoExpired,
        roles: contactUser.roles || [],
        enabled: contactUser.enabled
      };
      
      const updateResponse = await fetch(`http://localhost:8080/method/update/${currentUsername}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(contactToAdd)
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || 'Error al actualizar los contactos en el servidor');
      }
      
      const result = await updateResponse.json();
      
      setUsuarios(prev => 
        prev.map(u => u.username === result.user.username ? result.user : u)
      );
      
      setContactedUsers(prev => new Set([...prev, contactUsername]));

      const userContactsKey = `user_${currentUsername}_contacts`;
      const userContactsDataKey = `user_${currentUsername}_contacts_data`;
      
      const currentContacts = JSON.parse(localStorage.getItem(userContactsKey) || '[]');
      const currentContactsData = JSON.parse(localStorage.getItem(userContactsDataKey) || '{}');
      
      const updatedContacts = [...new Set([...currentContacts, contactUsername])];
      
      const updatedContactsData = { 
        ...currentContactsData,
        [contactUsername]: contactToAdd
      };
      
      localStorage.setItem(userContactsKey, JSON.stringify(updatedContacts));
      localStorage.setItem(userContactsDataKey, JSON.stringify(updatedContactsData));
      
      setUsuarios(prevUsuarios => 
        prevUsuarios.map(user => 
          user.username === contactUsername 
            ? { ...user, ...contactToAdd }
            : user
        )
      );
      
      localStorage.setItem('pendingToast', JSON.stringify({
        message: `¡${contactUsername} ha sido agregado a tus contactos!`,
        type: 'success'
      }));
      
      window.location.reload();
      
    } catch (error) {
      console.error('Error en handleContact:', error);
      toast.error(error.message || 'No se pudo establecer contacto. Inténtalo de nuevo más tarde.');
    }
  };

  const calculateRating = (requestedFavours, doneFavours) => {
    try {
      const requested = Number(requestedFavours) || 0;
      const done = Number(doneFavours) || 0;
      
      if (requested === 0 && done === 0) return 5.0;
      
      const totalActivity = requested + done;
      if (totalActivity < 3) return 5.0;
      
      const ratio = done / Math.max(requested, 1);
      
      let baseScore;
      if (ratio >= 1.5) {
        baseScore = 8.0 + Math.min(2.0, (ratio - 1.5) * 0.8);
      } else if (ratio >= 1.0) {
        baseScore = 6.5 + (ratio - 1.0) * 3.0;
      } else if (ratio >= 0.7) {
        baseScore = 5.5 + (ratio - 0.7) * 3.33;
      } else {
        baseScore = 3.0 + ratio * 3.57;
      }
      
      const activityWeight = Math.min(1.0, totalActivity / 20);
      const finalScore = 5.0 + (baseScore - 5.0) * activityWeight;
      
      return parseFloat(Math.max(1.0, Math.min(10.0, finalScore)).toFixed(1));
      
    } catch (error) {
      return 5.0;
    }
  };

  return (
    <div className="exp-dashboard">
      <div className="back-button-container-exp">
        <button 
          className="back-button" 
          onClick={() => navigate('/dashboard')}
        >
          Regresar
        </button>
      </div>
      <div className="user-dropdown">
        <div className="user-avatar" onClick={handleClick}>
          <div className="avatar-container">
            <img src={usuarios.find(usuario => usuario.username === username)?.picture || '/default-avatar.png'} 
                 alt="Perfil" 
                 className="avatar-image" />
            <div className="tooltip">@{username}</div>
          </div>
        </div>
        {showDropdown && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={() => { 
              const currentUser = usuarios.find(u => u.username === username);
              navigate('/profiledashboard', { state: currentUser }); 
              setShowDropdown(false); 
            }}>Mi perfil</div>
            <div className="dropdown-item" onClick={() => { navigate('/log-in'); setShowDropdown(false); }}>Cerrar sesión</div>
          </div>
        )}
      </div>
      <div className="header">
        <h3>Nuestros crowddiers</h3>
        {error && <p className="error">{error}</p>}
        <div className="search-container">
          <select
            className="search-select"
            value={searchType}
            onChange={handleSearchTypeChange}
          >
            {searchOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={`Buscar por ${searchOptions.find(opt => opt.value === searchType).label.toLowerCase()}`}
          />
        </div>
      </div>
      <div className="card-container">
        {getCurrentPageItems().map((usuario, index) => (
          <div key={`user-${usuario.id || 'unknown'}-${index}`} className={`card ${usuario.username === username ? 'selected' : ''}`}>
            <div className={`requested-favours ${usuario.username === username ? 'disabled' : ''}`}>
              <p>{usuario.requestedFavours}</p>
              <p>Solicitados</p>
            </div>
            <div className={`done-favours ${usuario.username === username ? 'disabled' : ''}`}>
              <p>{usuario.doneFavours}</p>
              <p>Realizados</p>
            </div>
            <div 
              className={`profile-picture-container ${usuario.username === username ? '' : 'clickable'}`} 
              onClick={usuario.username === username ? undefined : () => openModal(usuario.picture, usuario.username, usuarios.indexOf(usuario))}
            >
              <img 
                src={usuario.picture} 
                alt="Profile" 
                className={`profile-picture ${usuario.username === username ? 'disabled' : ''}`} 
                style={usuario.username === username ? { cursor: 'default', opacity: 0.7 } : {}} 
              />
            </div>
            <div className={`username-info ${usuario.username === username ? 'disabled' : ''}`} style={usuario.username === username ? { opacity: 0.7, cursor: 'default' } : {}}>
              <p>@{usuario.username}</p>
            </div>
            <div className={`rating-container ${usuario.username === username ? 'disabled' : ''}`} style={usuario.username === username ? { opacity: 0.7, cursor: 'default' } : {}}>
              <p>{calculateRating(usuario.requestedFavours, usuario.doneFavours)}</p>
            </div>
            <div className={`age-container ${usuario.username === username ? 'disabled' : ''}`} style={usuario.username === username ? { opacity: 0.7, cursor: 'default' } : {}}>
              <p>{calculateAge(usuario.birthday)}</p>
            </div>
            <div 
              className={`bio-container ${usuario.username === username ? 'disabled' : ''}`}
              style={usuario.username === username ? { opacity: 0.7, cursor: 'default' } : {}}
            >
              <p className="bio-text">
                {usuario.bio ? (usuario.bio.length > 100 ? `${usuario.bio.slice(0, 100)}...` : usuario.bio) : 'Sin biografía'}
              </p>
            </div>
            <div className={`location-container ${usuario.username === username ? 'disabled' : ''}`}>
              <img 
                src="./dashboard/location-icon.png" 
                alt="location-icon" 
                width="5%"
                className={usuario.username === username ? 'disabled' : ''}
              />
              <p>{usuario.location ? (usuario.location.length > 10 ? `${usuario.location.slice(0, 10)}...` : usuario.location) : 'Sin ubicación'}</p>
            </div>
            <div className="card-buttons">
              <button 
                className={`card-button perfil ${usuario.username === username ? 'disabled' : ''}`} 
                onClick={usuario.username === username ? undefined : () => navigate('/profiledashboard', { state: usuario })}
                disabled={usuario.username === username}
              >
                Perfil
              </button>
              <button 
                className={`card-button contactar ${contactedUsers.has(usuario.username) ? 'contacted' : ''} ${usuario.username === username ? 'disabled' : ''}`}
                onClick={usuario.username === username ? undefined : () => handleContact(usuario.username, usuario)}
                disabled={usuario.username === username}
              >
                {contactedUsers.has(usuario.username) ? 'Contactado' : 'Contactar'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {renderPagination()}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <img 
              src="https://cdn-icons-png.flaticon.com/128/18058/18058447.png" 
              alt="info-icon" 
              onClick={() => openModalInfo(usuarios[selectedUser.index])} 
              className="info-icon" 
            />
            <div className="modal-image-container">
              <button className="nav-button prev" onClick={() => {
                const currentIndex = selectedUser.index;
                const newIndex = (currentIndex - 1 + usuarios.length) % usuarios.length;
                const nextUser = usuarios[newIndex];
                setSelectedUser({
                  image: nextUser.picture || '/default-avatar.png',
                  name: nextUser.username,
                  index: newIndex
                });
              }}>
                ❮
              </button>
              <button className="nav-button next" onClick={() => {
                const currentIndex = selectedUser.index;
                const newIndex = (currentIndex + 1) % usuarios.length;
                const nextUser = usuarios[newIndex];
                setSelectedUser({
                  image: nextUser.picture || '/default-avatar.png',
                  name: nextUser.username,
                  index: newIndex
                });
              }}>
                ❯
              </button>
              <img src={selectedUser.image} alt="Profile" className="modal-image full" />
              <div className="modal-overlay-content">
                <h2 className="modal-username">@{selectedUser.name}</h2>
                <button className="close-button" onClick={closeModal}>Regresar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalInfoOpen && (
        <div className="modal-info-content">
          {usuarios && usuarios.filter(usuario => {
            return usuario.username === selectedUser?.name;
          }).map(usuario => (
            <div key={usuario.id} className='description-container'>
              <p className="username-info-title">Conoce a @{usuario.username}</p>
              <p className="username-info-body">{usuario.bio}</p>
              <div className="interests-container">
                {usuario.interests && 
                 (Array.isArray(usuario.interests) 
                   ? usuario.interests 
                   : String(usuario.interests || '').split(',')
                 ).map((interest, index) => (
                   <p key={index} className="interest-item">{String(interest).trim()}</p>
                 ))}
              </div>
              <button className="close-info" onClick={closeModalInfo}>Cerrar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpDashboard;
