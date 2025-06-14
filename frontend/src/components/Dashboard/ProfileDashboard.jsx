import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ProfileDashboard.css';

const shownNotifications = new Set();

const showNotification = (message, type = 'default', duration = 3000) => {
  const notificationKey = `${type}:${message}`;
  
  if (shownNotifications.has(notificationKey)) {
    return;
  }
  
  shownNotifications.add(notificationKey);

  switch (type) {
    case 'success':
      toast.success(message, { duration });
      break;
    case 'warning':
      toast.warning(message, { duration });
      break;
    case 'error':
      toast.error(message, { duration });
      break;
    case 'info':
      toast.info(message, { duration });
      break;
    default:
      toast(message, { duration });
  }
  
  setTimeout(() => {
    shownNotifications.delete(notificationKey);
  }, duration + 1000);
};

const SUGGESTED_FAVORS = [
  'Pasear al perro',
  'Hacer la compra',
  'Recoger paquete',
  'Cuidar plantas',
  'Llevar al aeropuerto',
  'Ayuda con la mudanza',
  'Clases particulares',
  'Reparaciones en casa',
  'Cuidar niños',
  'Pasear mascotas',
  'Ayuda con tareas domésticas',
  'Traducción de documentos',
  'Clases de idiomas',
  'Ayuda con la tecnología',
  'Compañía para ir al médico'
];

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

const formatInterests = (interests) => {
  if (!interests) return [];
  if (Array.isArray(interests)) return interests;
  if (typeof interests === 'string') return interests.split(';').filter(i => i.trim() !== '');
  return [];
};

export default function ProfileDashboard() {
  const location = useLocation();
  const user = location.state || {};
  const { selectedUser } = location.state || {};

  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [randomFavor, setRandomFavor] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState(null);

  const handleDeleteContact = async (contactId) => {
    if (!contactId || !window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      return;
    }

    setIsLoading(true);
    setDeletingContactId(contactId);
    
    const minDelay = 1000;
    const startTime = Date.now();
    
    try {
      const token = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId ? parseInt(storedUserId, 10) : null);
      if (!userId) {
        throw new Error('No se pudo identificar al usuario actual. Por favor, inicia sesión nuevamente.');
      }
      
      const response = await fetch(`http://localhost:8080/method/users/${userId}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (result.message && result.message.includes('no tiene contactos')) {
          setProfileData(prev => ({
            ...prev,
            contacts: []
          }));
          setDeletingContactId(null);
          return;
        }
        throw new Error(result.message || 'Error al eliminar el contacto');
      }

      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, minDelay - elapsed);
      
      if (remainingDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingDelay));
      }
      
      setProfileData(prev => ({
        ...prev,
        contacts: Array.isArray(prev.contacts) 
          ? prev.contacts.filter(contact => contact && contact.id != contactId)
          : []
      }));

      toast.success(result.message || 'Contacto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el contacto:', error);
      
      if (error.message && error.message.includes('no tiene contactos')) {
        setProfileData(prev => ({
          ...prev,
          contacts: []
        }));
      } else {
        toast.error(error.message || 'No se pudo eliminar el contacto');
      }
    } finally {
      setIsLoading(false);
      setDeletingContactId(null);
    }
  };
  
  const getRandomFavor = () => {
    const randomIndex = Math.floor(Math.random() * SUGGESTED_FAVORS.length);
    return SUGGESTED_FAVORS[randomIndex];
  };
  
  const handleMouseEnter = () => {
    setRandomFavor(getRandomFavor());
    setShowTooltip(true);
    setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    setShowTooltip(false);
    setIsHovering(false);
  };

  const handleIncludeFavor = () => {
    if (!randomFavor) return;
    
    if (randomFavor.length > 30) {
      showNotification('El favor sugerido es demasiado largo (máx. 30 caracteres)', 'warning');
      setRandomFavor(getRandomFavor());
      return;
    }
    
    setOffersData(prevOffers => {
      const favorExists = prevOffers.some(offer => 
        offer.toLowerCase() === randomFavor.toLowerCase()
      );
      
      if (favorExists) {
        showNotification(`"${randomFavor}" ya está en tu lista de favores`, 'warning');
        return prevOffers;
      }
      
      if (prevOffers.length >= 5) {
        showNotification('Se ha reemplazado el último favor de tu lista', 'info');
        return [...prevOffers.slice(0, -1), randomFavor];
      }
      
      return [...prevOffers, randomFavor];
    });

    setNeedsData(prevOffers => {
      const favorExists = prevOffers.some(offer => 
        offer.toLowerCase() === randomFavor.toLowerCase()
      );
      
      if (favorExists) {
        showNotification(`"${randomFavor}" ya está en tu lista de ofertas`, 'warning');
        return prevOffers;
      }
      
      if (prevOffers.length >= 5) {
        showNotification('Se ha reemplazado el último favor de tu lista', 'info');
        return [...prevOffers.slice(0, -1), randomFavor];
      }
      
      return [...prevOffers, randomFavor];
    });
    
    setRandomFavor(getRandomFavor());
  };

  const formatDateForMessage = (date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName.toLowerCase().charAt(0) + dayName.toLowerCase().slice(1)} ${day} de ${month} de ${year}`;
  };

  const handlePublish = (date) => {
    const formattedDate = formatDateForMessage(date);
    navigate('/dashboard', { 
      state: { 
        message: `... para el ${formattedDate}` 
      } 
    });
  };

  const navigate = useNavigate();
  
  useEffect(() => {
    const storedId = localStorage.getItem("id");
    if (!storedId) {
      
    } else {
      setUserId(parseInt(storedId, 10));
    }
  }, [navigate]);

  const isViewingOwnProfile = () => {
    const loggedInUsername = localStorage.getItem('username');
    const profileUsername = selectedUser?.username || user?.username;
    return !profileUsername || profileUsername === loggedInUsername;
  };

  const getUserStorageKey = () => {
    const username = localStorage.getItem('username');
    return username ? `userData_${username}` : 'userData';
  };

  const getInitialProfileData = () => {
    const viewingOwnProfile = isViewingOwnProfile();
    
    if (!viewingOwnProfile && (selectedUser || user)) {
      const profileData = selectedUser || user;
      return {
        id: profileData.id || '',
        username: profileData.username || '',
        name: profileData.name || '',
        surname: profileData.surname || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        picture: profileData.picture || '',
        birthday: profileData.birthday || null,
        interests: formatInterests(profileData.interests || []),
        requestedFavours: profileData.requestedFavours || 0,
        doneFavours: profileData.doneFavours || 0,
        isEnabled: profileData.isEnabled !== undefined ? profileData.isEnabled : true,
        accountNoExpired: profileData.accountNoExpired !== undefined ? profileData.accountNoExpired : true,
        accountNoLocked: profileData.accountNoLocked !== undefined ? profileData.accountNoLocked : true,
        credentialNoExpired: profileData.credentialNoExpired !== undefined ? profileData.credentialNoExpired : true,
        roles: profileData.roles || [],
        contacts: profileData.contacts || []
      };
    }
    
    const userStorageKey = getUserStorageKey();
    const savedUserData = localStorage.getItem(userStorageKey);
    
    if (savedUserData) {
      try {
        const parsedData = JSON.parse(savedUserData);
        return {
          id: parsedData.id || user?.id || selectedUser?.id || localStorage.getItem('id') || '',
          username: parsedData.username || user?.username || selectedUser?.username || localStorage.getItem('username') || '',
          name: parsedData.name || user?.name || selectedUser?.name || '',
          surname: parsedData.surname || user?.surname || selectedUser?.surname || '',
          bio: parsedData.bio || user?.bio || selectedUser?.bio || '',
          location: parsedData.location || user?.location || selectedUser?.location || '',
          picture: parsedData.picture || user?.picture || selectedUser?.picture || '',
          birthday: parsedData.birthday || user?.birthday || selectedUser?.birthday || null,
          interests: formatInterests(parsedData.interests || user?.interests || selectedUser?.interests || []),
          requestedFavours: parsedData.requestedFavours || user?.requestedFavours || selectedUser?.requestedFavours || 0,
          doneFavours: parsedData.doneFavours || user?.doneFavours || selectedUser?.doneFavours || 0,
          isEnabled: parsedData.isEnabled !== undefined ? parsedData.isEnabled : (user?.isEnabled !== undefined ? user.isEnabled : (selectedUser?.isEnabled !== undefined ? selectedUser.isEnabled : true)),
          accountNoExpired: parsedData.accountNoExpired !== undefined ? parsedData.accountNoExpired : (user?.accountNoExpired !== undefined ? user.accountNoExpired : (selectedUser?.accountNoExpired !== undefined ? selectedUser.accountNoExpired : true)),
          accountNoLocked: parsedData.accountNoLocked !== undefined ? parsedData.accountNoLocked : (user?.accountNoLocked !== undefined ? user.accountNoLocked : (selectedUser?.accountNoLocked !== undefined ? selectedUser.accountNoLocked : true)),
          credentialNoExpired: parsedData.credentialNoExpired !== undefined ? parsedData.credentialNoExpired : (user?.credentialNoExpired !== undefined ? user.credentialNoExpired : (selectedUser?.credentialNoExpired !== undefined ? selectedUser.credentialNoExpired : true)),
          roles: parsedData.roles || user?.roles || selectedUser?.roles || [],
          contacts: parsedData.contacts || user?.contacts || selectedUser?.contacts || []
        };
      } catch (error) {
        console.error('Error al analizar los datos del usuario guardados:', error);
      }
    }
    
    return {
      id: user?.id || selectedUser?.id || localStorage.getItem('id') || '',
      username: user?.username || selectedUser?.username || localStorage.getItem('username') || '',
      name: user?.name || selectedUser?.name || '',
      surname: user?.surname || selectedUser?.surname || '',
      bio: user?.bio || selectedUser?.bio || '',
      location: user?.location || selectedUser?.location || '',
      picture: user?.picture || selectedUser?.picture || '',
      birthday: user?.birthday || selectedUser?.birthday || null,
      interests: formatInterests(user?.interests || selectedUser?.interests || []),
      requestedFavours: user?.requestedFavours || selectedUser?.requestedFavours || 0,
      doneFavours: user?.doneFavours || selectedUser?.doneFavours || 0,
      isEnabled: user?.isEnabled !== undefined ? user.isEnabled : (selectedUser?.isEnabled !== undefined ? selectedUser.isEnabled : true),
      accountNoExpired: user?.accountNoExpired !== undefined ? user.accountNoExpired : (selectedUser?.accountNoExpired !== undefined ? selectedUser.accountNoExpired : true),
      accountNoLocked: user?.accountNoLocked !== undefined ? user.accountNoLocked : (selectedUser?.accountNoLocked !== undefined ? selectedUser.accountNoLocked : true),
      credentialNoExpired: user?.credentialNoExpired !== undefined ? user.credentialNoExpired : (selectedUser?.credentialNoExpired !== undefined ? selectedUser.credentialNoExpired : true),
      roles: user?.roles || selectedUser?.roles || [],
      contacts: user?.contacts || selectedUser?.contacts || []
    };
  };

  const [profileData, setProfileData] = useState(getInitialProfileData());
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileId = selectedUser?.id || user?.id || localStorage.getItem('id');
        if (!profileId) return;
        
        const response = await fetch(`http://localhost:8080/method/get/${profileId}`);
        if (!response.ok) throw new Error('Error al cargar los datos del perfil');
        
        const userData = await response.json();

        setProfileData(prev => ({
          ...prev,
          ...userData,
          interests: formatInterests(userData.interests || [])
        }));
        
        if (isViewingOwnProfile()) {
          const userStorageKey = getUserStorageKey();
          localStorage.setItem(userStorageKey, JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error al cargar los datos del perfil:', error);
      }
    };
    
    fetchProfileData();
  }, [selectedUser?.id, user?.id]); 
  
  const [selectedContact, setSelectedContact] = useState({ id: '', username: '', messages: [] });
  const [messageText, setMessageText] = useState('');
  
  const sendMessage = async (contactId, messageText) => {
    if (!messageText.trim() || !contactId) return;

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    const messageWithTime = `${messageText} - ${formattedTime}`;
    
    const senderName = profileData.name || profileData.username || 'Usuario';
    
    const newMessage = {
      id: Date.now(),
      senderId: userId,
      receiverId: contactId,
      content: messageWithTime,
      timestamp: now.toISOString()
    };

    try {
      const response = await fetch('http://localhost:8080/api/users/addMessage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: contactId,
          message: `${messageWithTime} (${profileData.username || profileData.name || 'Usuario'})`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el mensaje');
      }
      
      const result = await response.json();

      setAllUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === contactId) {
            return {
              ...user,
              messages: [...(user.messages || []), newMessage]
            };
          }
          return user;
        })
      );

      setSelectedContact(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage]
      }));

      setMessageText('');
      
      toast.success('Mensaje enviado correctamente');
      
      return result;

      const senderName = profileData.username || profileData.name || 'Usuario';
      showNotification(`Mensaje de ${senderName} enviado correctamente`, 'success');
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleContactChange = (contactId) => {
    if (!contactId) {
      setSelectedContact({ id: '', username: '', messages: [] });
      return;
    }
    
    const contactIdNum = parseInt(contactId, 10);
    const contactUser = allUsers.find(user => user.id === contactIdNum);
    
    if (contactUser) {
      setSelectedContact({
        id: contactUser.id,
        username: contactUser.username || `Usuario ${contactUser.id}`,
        messages: contactUser.messages || []
      });
    } else {
      setSelectedContact({
        id: contactIdNum,
        username: `Usuario ${contactIdNum}`,
        messages: []
      });
    }
    
    setMessageText('');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/method/get');
        if (response.ok) {
          const data = await response.json();
          setAllUsers(data);
        } else {
          console.error('Failed to fetch users:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);  
  
  const [offersData, setOffersData] = useState([
    'Cuidado de mascotas',
    'Clases particulares',
    'Reparaciones del hogar'
  ]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  
  const [needsData, setNeedsData] = useState([
    'Ayuda con la compra',
    'Transporte ocasional',
    'Cuidado de plantas'
  ]);
  const [selectedNeed, setSelectedNeed] = useState(null);

  const calculateRating = (requestedFavours, doneFavours) => {
    try {
      const reqFav = Number(requestedFavours) || 0;
      const donFav = Number(doneFavours) || 0;
      
      if (reqFav === 0 && donFav === 0) return 1;

      const totalFavours = Math.max(reqFav + donFav, 1);
      const standardRequested = reqFav / totalFavours;
      const standardDone = donFav / totalFavours;
      const ratio = standardDone / Math.max(standardRequested, 0.01);
      const baseRating = (standardDone * 5) + (standardRequested * 5);
      const consistency = Math.min(Math.max(ratio, 0.5), 2) * 2;

      const rating = Math.max(1, Math.min(10, baseRating + consistency));
      return parseFloat(rating.toFixed(1)); 
    } catch (error) {
      console.error('Error al calcular la calificación:', error);
      return 1.0; 
    }
  };
  
  const [calendarData, setCalendarData] = useState({
    availability: 'Lunes a Viernes, 9:00 - 18:00',
    timeZone: 'Europe/Madrid'
  });
  
  const [editingItem, setEditingItem] = useState({});
  const [tempData, setTempData] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
  
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setTempData(prev => ({
            ...prev,
            [name]: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }
      return;
    }
    
    if (name === 'interests') {

      const interestsArray = value
        .split(',')
        .map(interest => interest.trim())
        .filter(interest => interest.length > 0);
      
      setTempData(prev => ({
        ...prev,
        [name]: interestsArray
      }));
      return;
    }
    
    setTempData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleListChange = (index, value) => {
    if (value.length > 30) {
      showNotification('El favor no puede tener más de 30 caracteres', 'warning');
      return;
    }
    
    const newList = [...tempData.items];
    newList[index] = value;
    setTempData(prev => ({
      ...prev,
      items: newList
    }));
  };

  const handleAddItem = () => {
    if (tempData.items.length >= 5) {
      showNotification('Solo puedes agregar hasta 5 elementos', 'warning');
      return;
    }
    
    const newItem = 'Nuevo elemento';
    
    if (newItem.length > 30) {
      showNotification('El favor no puede tener más de 30 caracteres', 'warning');
      return;
    }
    
    const itemExists = tempData.items.some(item => 
      item.toLowerCase() === newItem.toLowerCase()
    );
    
    if (itemExists) {
      showNotification('Este favor ya está en tu lista', 'warning');
      return;
    }
    
    setTempData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemoveItem = (index) => {
    const newItems = tempData.items.filter((_, i) => i !== index);
    setTempData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const updateUser = async (userData) => {
    const token = localStorage.getItem('token');
    const currentUsername = profileData.username;
    const currentUserId = profileData.id;

    if (!currentUserId) {
      const error = new Error('No se pudo identificar el usuario actual');
      console.error('Error en updateUser:', { profileData, userData });
      throw error;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/method/update-profile/${currentUserId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        const error = new Error(responseData.message || 'Error al actualizar el perfil');
        console.error('Error en la respuesta:', error.message);
        throw error;
      }
      
      if (responseData.user?.username && responseData.user.username !== currentUsername) {
        localStorage.setItem('username', responseData.user.username);
      }
      
      return responseData.user || responseData;
    } catch (error) {
      console.error('Error en updateUser:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      switch (currentSlide) {
        case 0: 
          const profileUpdate = {
            username: tempData.username || profileData.username,
            name: tempData.name || profileData.name || '',
            surname: tempData.surname || profileData.surname || '',
            bio: tempData.bio || profileData.bio || '',
            location: tempData.location || profileData.location || '',
            birthday: tempData.birthday || profileData.birthday || null,
            picture: tempData.picture || profileData.picture || ''
          };
          
          if (tempData.interests !== undefined) {
            if (typeof tempData.interests === 'string') {
              profileUpdate.interests = tempData.interests
                .split(',')
                .map(i => i.trim())
                .filter(i => i.length > 0);
            } else if (Array.isArray(tempData.interests)) {
              profileUpdate.interests = [...tempData.interests];
            }
          } else {
            profileUpdate.interests = [...(profileData.interests || [])];
          }

          const updatedUser = await updateUser(profileUpdate);

          const updatedProfile = {
            ...profileData,
            ...profileUpdate,
            ...updatedUser,
            interests: formatInterests(updatedUser.interests || profileUpdate.interests || profileData.interests || [])
          };

          setProfileData(updatedProfile);

          if (isViewingOwnProfile()) {
            const userStorageKey = getUserStorageKey();
            localStorage.setItem(userStorageKey, JSON.stringify(updatedProfile));

            if (updatedUser.username && updatedUser.username !== profileData.username) {
              localStorage.setItem('username', updatedUser.username);
            }
          }
          
          if (tempData.picture && tempData.picture !== profileData.picture) {
            setProfileData(prev => ({
              ...prev,
              picture: tempData.picture
            }));
          }
          break;
          
        case 1: 
          setOffersData([...tempData.items]);
          break;
          
        case 2: 
          setNeedsData([...tempData.items]);
          break;
          
        case 3: 
          setCalendarData({ ...tempData });
          break;
          
        case 4: 
          setContactData({ ...tempData });
          break;
          
        default:
          break;
      }
      
      showNotification('Guardado correctamente', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      showNotification(error.message || 'Error al guardar los cambios. Por favor, inténtalo de nuevo.', 'error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleEditClick = () => {
    switch (currentSlide) {
      case 0: 
        setEditingItem({
          title: 'Editar Perfil',
          type: 'profile',
          fields: [
            { 
              name: 'picture', 
              label: 'URL de la foto de perfil', 
              type: 'text',
              placeholder: 'https://ejemplo.com/foto.jpg'
            },
            { 
              name: 'username', 
              label: 'Nombre de usuario', 
              type: 'text',
              required: true
            },
            { 
              name: 'name', 
              label: 'Nombre', 
              type: 'text',
              required: true
            },
            { 
              name: 'surname', 
              label: 'Apellidos', 
              type: 'text'
            },
            { 
              name: 'birthday', 
              label: 'Fecha de nacimiento', 
              type: 'date',
              max: new Date().toISOString().split('T')[0]
            },
            { 
              name: 'interests', 
              label: 'Intereses (separados por comas)', 
              type: 'text',
              placeholder: 'Ej: música, deporte, lectura'
            },
            { 
              name: 'location', 
              label: 'Ubicación', 
              type: 'text' 
            },
            { 
              name: 'bio', 
              label: 'Biografía', 
              type: 'textarea' 
            }
          ]
        });

        const formData = {
          username: profileData.username || '',
          name: profileData.name || '',
          surname: profileData.surname || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          birthday: profileData.birthday ? profileData.birthday.split('T')[0] : '',
          picture: profileData.picture || '',
          interests: Array.isArray(profileData.interests) 
            ? profileData.interests.join(', ') 
            : (profileData.interests || '')
        };
        
        setTempData(formData);
        break;
      case 1: 
        setEditingItem({
          title: 'Editar Ofertas',
          type: 'list',
          fields: [
            { name: 'items', label: 'Servicios que ofreces', type: 'list' }
          ]
        });
        setTempData({ items: [...offersData] });
        break;
      case 2: 
        setEditingItem({
          title: 'Editar Necesidades',
          type: 'list',
          fields: [
            { name: 'items', label: 'Servicios que necesitas', type: 'list' }
          ]
        });
        setTempData({ items: [...needsData] });
        break;
      case 3: 
        setEditingItem({
          title: 'Editar Disponibilidad',
          type: 'form',
          fields: [
            { name: 'availability', label: 'Disponibilidad', type: 'text' },
            { name: 'timeZone', label: 'Zona horaria', type: 'text' }
          ]
        });
        setTempData({ ...calendarData });
        break;
      case 4:
        setEditingItem({
          title: 'Editar Contacto',
          type: 'form',
          fields: [
          ]
        });
        setTempData({ ...contactData });
        break;
      default:
        break;
    }
    setIsEditing(true);
  };

  const nextSlide = () => {
    if (isOwner) {
      sliderRef.current.slickNext();
    }
  };

  const prevSlide = () => {
    if (isOwner) {
      sliderRef.current.slickPrev();
    }
  };

  const calculateAge = (birthday) => {
    if (!birthday) return 'No especificada';
    
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) return 'Fecha inválida';
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const parsedUserId = parseInt(storedUserId, 10);
      setUserId(parsedUserId);
      setIsOwner(parsedUserId === (profileData?.id || null));
    }
  }, [profileData?.id]);

  const settings = {
    dots: isOwner,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    adaptiveHeight: true,
    swipe: false,
    swipeToSlide: false,
    touchMove: false,
    draggable: false,
    swipeEvent: () => false,
    appendDots: dots => (
      <div style={{
        position: 'absolute',
        bottom: '2px',
        width: '100%',
        padding: '0',
        margin: '0',
        textAlign: 'center',
      }}>
        <ul style={{ margin: '0', padding: '0' }}> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: currentSlide === i ? '#4a90e2' : '#ccc',
        margin: '0 5px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }} />
    ),
    beforeChange: isOwner ? (current, next) => setCurrentSlide(next) : () => {},
  };

  return (
    <div className="profile-dashboard">
      <div className="profile-container">
        <div className="back-button-container-profile">
          <button onClick={() => navigate('/dashboard')} className="back-button">Regresar</button>
        </div>
        {isOwner && currentSlide !== 4 && (
          <button className="settings-button" onClick={handleEditClick} aria-label="Ajustes">
            <Settings size={24} />
          </button>
        )}

        {isOwner && isEditing && (
          <div className="modal-overlay">
            <div className="edit-modal">
              <div className="modal-header">
                <h3>{editingItem.title}</h3>
              </div>
              <div className="modal-body">
                {editingItem.fields?.map((field, index) => {
                  if (field.type === 'list') {
                    return (
                      <div key={field.name} className="form-group">
                        <label>{field.label}</label>
                        {tempData.items?.map((item, idx) => (
                          <div key={idx} className="list-item">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => handleListChange(idx, e.target.value)}
                              className="list-input"
                            />
                            <button 
                              onClick={() => handleRemoveItem(idx)}
                              className="remove-button"
                              type="button"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={handleAddItem}
                          className="add-button"
                          type="button"
                          disabled={tempData.items?.length >= 5}
                        >
                          + Añadir {field.label.toLowerCase()}
                        </button>
                        {tempData.items?.length >= 5 && (
                          <p className="max-items-message">
                            Has alcanzado el límite de 5 elementos
                          </p>
                        )}
                      </div>
                    );
                  }
                  
                  if (field.name === 'picture') {
                    return (
                      <div key={index} className="form-group">
                        <label>{field.label}</label>
                        <input
                          type="text"
                          name="picture"
                          value={tempData.picture || ''}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          className="picture-url-input"
                        />
                        {tempData.picture && (
                          <div className="picture-preview-container">
                            <p className="preview-label">Vista previa:</p>
                            <img 
                              src={tempData.picture} 
                              alt="Vista previa de la imagen"
                              className="picture-preview"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'block';
                              }}
                            />
                            <p className="preview-error" style={{display: 'none'}}>
                              No se pudo cargar la imagen. Verifica la URL.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={index} className="form-group">
                      <label>{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={tempData[field.name] || ''}
                          onChange={handleInputChange}
                          rows="4"
                          required={field.required}
                          placeholder={field.placeholder || ''}
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          name={field.name}
                          value={tempData[field.name] || ''}
                          onChange={handleInputChange}
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          max={field.max}
                          className={field.type === 'date' ? 'date-input' : ''}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="modal-footer">
                <button onClick={handleCancel} className="cancel-button">
                  Cancelar
                </button>
                <button onClick={handleSave} className="save-button">
                  <Check size={18} /> Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {isOwner && (
          <div className="slider-navigation">
            <button onClick={prevSlide} className="nav-arrow">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="nav-arrow">
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      
        <div 
          onTouchStart={!isOwner ? (e) => e.stopPropagation() : undefined}
          onTouchMove={!isOwner ? (e) => e.preventDefault() : undefined}
          onMouseDown={!isOwner ? (e) => e.preventDefault() : undefined}
          style={!isOwner ? { pointerEvents: 'none', userSelect: 'none' } : {}}
        >
          <Slider 
            ref={sliderRef} 
            {...settings} 
            className="profile-slider"
            style={!isOwner ? { pointerEvents: 'none' } : {}}
          >
          <div className="slide1">
            <div className='header'>
              <div className="banner-gradient" />
              <img 
                src={profileData.picture}
                alt='profile-picture' 
                className="profile-pic" 
              />
              <h3 className="profile-username">{profileData.username}</h3>
              <p className="profile-name">{profileData.name} {profileData.surname && profileData.surname !== profileData.name && ` ${profileData.surname}`}</p>
              <p className="profile-location">{profileData.location}</p>
              <div className="profile-bio">
                <p>Biografía</p>
                <p>{profileData.bio}</p>
              </div>
              <div className="profile-rating">
                <span>⭐ {calculateRating(profileData.requestedFavours || 0, profileData.doneFavours || 0)}/10</span>
              </div>
              {profileData.interests && profileData.interests.length > 0 && (
                <div className="profile-interests">
                  <span>Intereses: {profileData.interests.length > 20 ? profileData.interests.join(', ') : profileData.interests.join(', ').slice(0, 20) + '...'}</span>
                </div>
              )}
              <p className="profile-requested-favours">Favores solicitados: {profileData.requestedFavours}</p>
              <p className="profile-done-favours">Favores realizados: {profileData.doneFavours}</p>
              <div className="birthday-container">
                <p className="birthday-date">Fecha de nacimiento: {profileData.birthday}</p>
                <p className="birthday-age">{calculateAge(profileData.birthday)} años</p>
              </div>
              <div className="message-container">
                  <textarea 
                    name="message" 
                    id="message" 
                    className="profile-message" 
                    placeholder={selectedContact.username 
                      ? `Escribe un mensaje a ${selectedContact.username}`
                      : 'Escribe un mensaje a un contacto'}
                    disabled={!selectedContact.id || userId !== profileData.id}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  ></textarea>
                <div className="select-container">
                  <select 
                    name="contact" 
                    id="contact" 
                    className="select-message" 
                    value={selectedContact.id}
                    disabled={userId !== profileData.id || !profileData.contacts || profileData.contacts.length === 0}
                    onChange={(e) => handleContactChange(e.target.value)}
                    title={!profileData.contacts || profileData.contacts.length === 0 ? 'No hay contactos disponibles' : (selectedContact.id ? '' : 'Selecciona un contacto')}
                  >
                    <option value="" style={{ display: 'none' }}>Selecciona un contacto</option>
                    {profileData.contacts && profileData.contacts.map((contact, index) => {
                      if (typeof contact === 'number') {
                        const user = allUsers.find(user => user.id === contact);
                        return (
                          <option key={index} value={contact}>
                          {user ? user.username : `Usuario ${contact}`}
                        </option>
                        );
                      }
                      return (
                        <option key={index} value={contact.id || contact.username}>
                          {contact.username}
                        </option>
                      );
                    })}
                  </select>
                  <button 
                    className="message-button"
                    onClick={async () => {
                      try {
                        await sendMessage(selectedContact.id, messageText);
                      } catch (error) {
                        console.error('Error al enviar el mensaje:', error);
                      }
                    }}
                    disabled={userId !== profileData.id || !profileData.contacts || profileData.contacts.length === 0}
                  >
                    Enviar mensaje
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="slide">
            <div className="offering-info">
              <h1>Lo que ofrezco</h1>
              <div className="offering-list">
                <ul>
                  {offersData.map((offer, index) => (
                    <li 
                      key={index} 
                      className={selectedOffer === index ? 'selected' : ''}
                      onClick={() => setSelectedOffer(selectedOffer === index ? null : index)}
                    >
                      {offer}
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                className="action-button" 
                disabled={selectedOffer === null}
                onClick={() => {
                  if (selectedOffer !== null) {
                    const service = offersData[selectedOffer];
                    const message = `Ofrezco ${service.charAt(0).toLowerCase() + service.slice(1)}`;
                    navigate('/dashboard', { 
                      state: { 
                        message,
                        from: 'offer' 
                      } 
                    });
                  }
                }}
              >
                {selectedOffer !== null ? `Ofrecer: ${offersData[selectedOffer]}` : 'Selecciona un favor'}
              </button>
              <div className="suggested-favor-container">
                <button 
                  className="suggested-favours-button action-button"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleIncludeFavor}              >
                  {isHovering ? 'Incluir favor' : 'Sugerir favor'}
                </button>
                {showTooltip && (
                  <div className="suggested-favor-tooltip">
                    {randomFavor}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="slide">
            <div className="request-info">
              <h1>Lo que necesito</h1>
              <div className="request-list">
                <ul>
                  {needsData.map((need, index) => (
                    <li 
                      key={index}
                      className={selectedNeed === index ? 'selected' : ''}
                      onClick={() => setSelectedNeed(selectedNeed === index ? null : index)}
                    >
                      {need}
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                className="action-button" 
                disabled={selectedNeed === null}
                onClick={() => {
                  if (selectedNeed !== null) {
                    const need = needsData[selectedNeed];
                    const message = `Necesito ${need.charAt(0).toLowerCase() + need.slice(1)}`;
                    navigate('/dashboard', { 
                      state: { 
                        message,
                        from: 'need' 
                      } 
                    });
                  }
                }}
              >
                {selectedNeed !== null ? `Solicitar: ${needsData[selectedNeed]}` : 'Selecciona una necesidad'}
              </button>
              <div className="suggested-favor-container">
                <button 
                  className="suggested-favours-button action-button"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleIncludeFavor}              >
                  {isHovering ? 'Incluir favor' : 'Sugerir favor'}
                </button>
                {showTooltip && (
                  <div className="suggested-favor-tooltip">
                    {randomFavor}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="slide">
            <div className="calendar-info">
              <h1>Mi Calendario</h1>
              <div className="calendar-details">
                <div className="calendar-icon">
                  <CalendarIcon size={48} />
                </div>
                <div className="calendar-text">
                  <p className="availability"><strong>Disponibilidad:</strong> {calendarData.availability}</p>
                  <p className="timezone"><strong>Zona horaria:</strong> {calendarData.timeZone}</p>
                </div>
              </div>
              <div className="calendar-actions">
                <button 
                  className="action-button"
                  onClick={() => setShowAvailabilityModal(true)}
                >
                  Ver disponibilidad
                </button>
              </div>
            </div>
          </div>

          <div className="slide">
            <div className="contacts-info">
              <h1>Contactos</h1>
              <div className="contacts-list">
                {profileData?.contacts?.length > 0 ? (
                  <div className="contacts-container">
                    {profileData.contacts.map((contact, index) => (
                      <div key={contact.id || index} className="contact-item">
                        <img 
                          src={contact.picture || '/default-avatar.png'} 
                          alt={contact.username} 
                          className="contact-avatar"
                        />
                        <div className="contact-info">
                          <span className="contact-name">{contact.name || contact.username}</span>
                          {contact.bio && <p className="contact-bio">{contact.bio}</p>}
                          <div 
                            className={`delete-overlay ${deletingContactId === (contact.id || contact.username) ? 'deleting' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContact(contact.id || contact.username);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {deletingContactId === (contact.id || contact.username) ? (
                              <>
                                <div className="loading-spinner"></div>
                                Eliminando...
                              </>
                            ) : (
                              <>
                                Eliminar <br /> @{contact.username}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="no-contacts">Sin contactos</p>
                  </div>
                )}
              </div>
              {allUsers.length > 0 && (
                <div className="add-contact-container">
                  <button onClick={() => navigate('/expdashboard')} className="add-contact-button">Añadir contactos</button>
                  <span className="tooltip-text">{(allUsers.length - 1) - profileData.contacts.length === 0 ? 'No hay crowddiers disponibles' : (allUsers.length - 1) - profileData.contacts.length === 1 ? '1 crowddier disponible' : `${(allUsers.length - 1) - profileData.contacts.length} crowddiers disponibles`}</span>
                </div>
              )}
            </div>
          </div>
          </Slider>
        </div>

        {showAvailabilityModal && (
          <div className="modal-overlay" onClick={() => setShowAvailabilityModal(false)}>
            <div className="availability-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Mi Disponibilidad</h3>
              </div>
              <div className="modal-body">
                <div className="availability-details">
                  <p><strong>Horario:</strong> {calendarData.availability}</p>
                  <p><strong>Zona horaria:</strong> {calendarData.timeZone}</p>
                  <div className="calendarContainer">
                    <Calendar
                      value={new Date()}
                      className="calendar"
                      minDetail="month"
                      next2Label={null}
                      prev2Label={null}
                      showNeighboringMonth={false}
                      navigationLabel={({ date, label }) => (
                        <span className="calendarMonthLabel">
                          {label.toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                        </span>
                      )}
                      formatShortWeekday={(locale, date) => 
                        ['D', 'L', 'M', 'X', 'J', 'V', 'S'][date.getDay()]
                      }
                      navigationAriaLabel={null}
                      nextAriaLabel="Siguiente mes"
                      prevAriaLabel="Mes anterior"
                      nextLabel={<span className="calendarNavArrow">❯</span>}
                      prevLabel={<span className="calendarNavArrow">❮</span>}
                      tileClassName={({ date, view, activeStartDate }) => {
                        const classes = ['calendarDay'];
                        
                        if (view === 'month') {
                          const day = date.getDay();
                          if (day >= 1 && day <= 5) {
                            classes.push('calendarDay-available');
                          }
                        }
                        
                        const today = new Date();
                        if (
                          date.getDate() === today.getDate() &&
                          date.getMonth() === today.getMonth() &&
                          date.getFullYear() === today.getFullYear()
                        ) {
                          classes.push('calendarDay-today');
                        }
                        
                        return classes.join(' ');
                      }}
                      formatMonthYear={(locale, date) => {
                        const months = [
                          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                        ];
                        return `${months[date.getMonth()]} ${date.getFullYear()}`;
                      }}
                      formatMonth={(locale, date) => {
                        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                        return months[date.getMonth()];
                      }}
                      onChange={(date) => setSelectedDate(date)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="footer-actions">
                  {selectedDate && (
                    <button 
                      className="publish-button"
                      onClick={() => handlePublish(selectedDate)}
                    >
                      Publicar
                    </button>
                  )}
                  <button 
                    className="close-modal-button"
                    onClick={() => {
                      setShowAvailabilityModal(false);
                      setSelectedDate(null);
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}