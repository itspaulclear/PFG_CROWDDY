import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckCircle, FaInfoCircle, FaExclamationCircle, FaCheck } from 'react-icons/fa';
import { toast } from 'sonner';
import './NotificationsDashboard.css';

function NotificationsDashboard() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmedNotifications, setConfirmedNotifications] = useState(new Set());

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        
        if (!username || !token) {
          throw new Error('No se encontró la información de autenticación');
        }

        const response = await fetch(`http://localhost:8080/api/users/${encodeURIComponent(username)}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error al cargar notificaciones: ${errorData}`);
        }

        const data = await response.json();
        if (data.success) {
          const sortedNotifications = [...data.notifications].reverse();
          setNotifications(sortedNotifications);
        } else {
          throw new Error(data.message || 'Error al cargar notificaciones');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Error al cargar notificaciones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const deleteNotification = async (index) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = localStorage.getItem('username');
      
      if (!token || !currentUser) {
        throw new Error('No se pudo verificar la autenticación');
      }
      
      const url = `http://localhost:8080/api/users/${encodeURIComponent(currentUser)}/notifications/${index}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al eliminar la notificación');
      }
      
      const result = await response.json();
      return result.success;
      
    } catch (error) {
      console.error('Error al eliminar la notificación:', error);
      return false;
    }
  };

  const handleConfirm = async (notificationId, e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      const currentUser = localStorage.getItem('username');
      
      if (!token || !currentUser) {
        throw new Error('No se pudo verificar la autenticación');
      }
      
      const notification = notifications[notificationId];

      const targetUsername = notification.split(' ')[0];
      
      if (!targetUsername) {
        throw new Error('No se pudo determinar el usuario que realizó el favor');
      }

      const deleteResponse = await fetch(
        `http://localhost:8080/api/users/${encodeURIComponent(currentUser)}/notifications/${notificationId}`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.error('Error al eliminar la notificación:', errorText);
        throw new Error('No se pudo eliminar la notificación del servidor');
      }

      const deleteResult = await deleteResponse.json();
      if (!deleteResult.success) {
        throw new Error(deleteResult.message || 'Error al eliminar la notificación');
      }

      const incrementResponse = await fetch('http://localhost:8080/api/users/increment-favours', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ targetUsername }),
        credentials: 'include'
      });
      
      if (!incrementResponse.ok) {
        const errorText = await incrementResponse.text();
        console.error('Error en la respuesta de increment-favours:', errorText);
        throw new Error(errorText || `Error al actualizar el contador de favores: ${incrementResponse.status} ${incrementResponse.statusText}`);
      }
      
      const incrementResult = await incrementResponse.json();
      
      if (!incrementResult.success) {
        throw new Error(incrementResult.message || 'Error al actualizar el contador de favores');
      }
      
      setNotifications(prev => prev.filter((_, index) => index !== notificationId));
      
      setConfirmedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.add(notificationId);
        return newSet;
      });

      toast.success(`¡Favor confirmado correctamente!`);
      
    } catch (error) {
      console.error('Error al confirmar el favor:', error);
      toast.error(error.message || 'Error al confirmar el favor');
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.includes('aceptado')) {
      return <FaCheckCircle className="notification-icon success" />;
    } else if (notification.includes('ofrece')) {
      return <FaInfoCircle className="notification-icon info" />;
    }
    return <FaBell className="notification-icon default" />;
  };

  if (isLoading) {
    return (
      <div className="notifications-loading">
        <div className="loading-spinner"></div>
        <p>Cargando notificaciones...</p>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="back-notifications-container">
          <button className="back-notifications-button" onClick={() => navigate('/dashboard')}>Regresar</button>
        </div>
        <h2><FaBell /> Notificaciones</h2>
        {notifications.length === 0 ? (
          <p className="no-notifications">No tienes notificaciones</p>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification, index) => (
              <div key={index} className={`notification-item ${confirmedNotifications.has(index) ? 'confirmed' : ''}`}>
                <div className="notification-icon-container">
                  {getNotificationIcon(notification)}
                </div>
                <div className="notification-content">
                  <p>{notification}</p>
                  <div className="notification-footer">
                    <span className="notification-time">
                      {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!confirmedNotifications.has(index) && (
                      <button 
                        className="confirm-button"
                        onClick={(e) => handleConfirm(index, e)}
                        title="Marcar como confirmado"
                      >
                        <FaCheck /> Confirmar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsDashboard;