import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './MessagesDashboard.css';

function MessagesDashboard() {
  const navigate = useNavigate();


  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);

  const processMessages = useCallback((currentUser, users) => {
    if (!currentUser || !Array.isArray(users)) {
      return [];
    }
    
    const currentUsername = currentUser.username;
    const allMessages = [];
    
    if (Array.isArray(currentUser.messages)) {
      
      currentUser.messages.forEach((message, index) => {
        if (typeof message !== 'string') {
          return;
        }
        
        const match = message.match(/^(.*?)\s*-\s*(\d{1,2}:\d{2})\s*\(([^)]+)\)\s*$/);
        
        let content, senderUsername, timestamp;
        
        if (match) {
          content = match[1].trim();
          timestamp = match[2];
          senderUsername = match[3].trim();
        } else {
          const fallbackMatch = message.match(/(.*?)\s*\(([^)]+)\)\s*$/);
          if (!fallbackMatch) return;
          
          content = fallbackMatch[1].trim();
          senderUsername = fallbackMatch[2].trim();
          timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }
        
        if (senderUsername !== currentUsername) {
          const sender = users.find(u => u && u.username === senderUsername);
          
          allMessages.push({
            content: content || 'Sin contenido',
            sender: {
              username: senderUsername,
              picture: (sender && sender.picture) || '/default-avatar.png',
              isCurrentUser: false
            },
            timestamp: new Date().toISOString(),
            original: message,
            type: 'received',
            conversationWith: senderUsername
          });
        }
      });
    }

    users.forEach(user => {
      if (!user || !Array.isArray(user.messages)) return;
      
      user.messages.forEach((message, index) => {
        if (typeof message !== 'string') {
          return;
        }
        
        const match = message.match(/^(.*?)\s*-\s*(\d{1,2}:\d{2})\s*\(([^)]+)\)\s*$/);
        
        let content, senderUsername, timestamp;
        
        if (match) {
          content = match[1].trim();
          timestamp = match[2];
          senderUsername = match[3].trim();
        } else {
          const fallbackMatch = message.match(/(.*?)\s*\(([^)]+)\)\s*$/);
          if (!fallbackMatch) return;
          
          content = fallbackMatch[1].trim();
          senderUsername = fallbackMatch[2].trim();
          timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }
        
        if (senderUsername === currentUsername) {
          allMessages.push({
            content: content || 'Sin contenido',
            sender: {
              username: currentUsername,
              picture: currentUser.picture || '/default-avatar.png',
              isCurrentUser: true
            },
            timestamp: new Date().toISOString(),
            original: message,
            type: 'sent',
            conversationWith: user.username
          });
        }
      });
    });
    
    return allMessages;
  }, []);

  const groupByConversation = useCallback((messages, users, currentUsername) => {
    const conversations = {};

    const usersMap = users.reduce((acc, user) => {
      if (user && user.username) {
        acc[user.username] = user;
      }
      return acc;
    }, {});
    
    messages.forEach(message => {
      const otherUsername = message.conversationWith;
      
      if (!otherUsername) {
        return;
      }

      const otherUser = usersMap[otherUsername] || {
        username: otherUsername,
        picture: '/default-avatar.png',
        name: otherUsername
      };
      
      if (!conversations[otherUsername]) {
        conversations[otherUsername] = {
          user: otherUser.username,
          avatar: otherUser.picture || '/default-avatar.png',
          displayName: otherUser.name || otherUser.username,
          lastMessage: message.content,
          lastMessageTime: message.timestamp,
          unreadCount: 0, 
          messages: []
        };
      }
      
      if (new Date(message.timestamp) > new Date(conversations[otherUsername].lastMessageTime || 0)) {
        conversations[otherUsername].lastMessage = message.content;
        conversations[otherUsername].lastMessageTime = message.timestamp;
      }
      
      conversations[otherUsername].messages.push({
        ...message,
        isCurrentUser: message.sender.username === currentUsername
      });
      
      conversations[otherUsername].messages.sort((a, b) => {
        const timeA = a.original.match(/-\s*(\d{1,2}:\d{2})/);
        const timeB = b.original.match(/-\s*(\d{1,2}:\d{2})/);
        
        if (timeA && timeB) {
          const [hoursA, minutesA] = timeA[1].split(':').map(Number);
          const [hoursB, minutesB] = timeB[1].split(':').map(Number);
          
          if (hoursA !== hoursB) return hoursA - hoursB;
          return minutesA - minutesB;
        }
        
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
    });

    const sortedConversations = Object.values(conversations).sort((a, b) => {
      return new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0);
    });
    
    return sortedConversations;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/method/get');
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        const data = await response.json();
        setUsers(data);
        
        const currentUsername = localStorage.getItem('username') || 'admin';
        
        if (currentUsername) {
          const currentUserData = data.find(user => user && user.username === currentUsername);
          setCurrentUser(currentUserData);
          
          const messages = processMessages(currentUserData, data);
          const conversations = groupByConversation(messages, data, currentUsername);
          setActiveConversation(conversations[0]?.user || null);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('No se pudieron cargar los mensajes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [processMessages, groupByConversation]);

  const { conversations, currentConversation } = useMemo(() => {
    if (!currentUser || !users.length) {
      return { conversations: [], currentConversation: { messages: [] } };
    }
    
    const messages = processMessages(currentUser, users);
    
    const conversationsList = groupByConversation(messages, users, currentUser.username);
    
    const activeConv = activeConversation || (conversationsList[0]?.user || null);
    
    const result = {
      conversations: conversationsList,
      currentConversation: conversationsList.find(c => c.user === activeConv) || { 
        messages: [],
        user: '',
        avatar: '/default-avatar.png',
        displayName: ''
      }
    };
    
    return result;
  }, [currentUser, users, activeConversation, processMessages, groupByConversation]);

  if (loading) return <div className="loading">Cargando mensajes...</div>;
  if (error) return <div className="error">{error}</div>;

  const renderMessages = () => {
    if (!currentConversation || !Array.isArray(currentConversation.messages) || currentConversation.messages.length === 0) {
      return <div className="no-messages">No hay mensajes en esta conversación</div>;
    }

    return currentConversation.messages.map((message, index) => (
      <div 
        key={`${message.original}-${index}`} 
        className={`message-wrapper ${message.isCurrentUser ? 'sent' : 'received'}`}
      >
        {!message.isCurrentUser && (
          <div className="message-sender">
            <img 
              src={message.sender?.picture || '/default-avatar.png'} 
              alt={message.sender?.username || 'Usuario'} 
              className="sender-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
            <span className="sender-username">
              {message.sender?.username || 'Usuario'}
            </span>
          </div>
        )}
        <div className="message-content">
          <div className="message-text">
            {message.content || 'Mensaje sin contenido'}
          </div>
          <div className="message-timestamp">
            {message.original.match(/-\s*(\d{1,2}:\d{2})/)?.[1] || ''}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="messagesDashboard">
      <div className="back-button-container">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="back-button"
          aria-label="Regresar"
        >
          Regresar
        </button>
      </div>
      
      <div className="conversations-container">
        <div className="conversations-sidebar">
          <h3>Conversaciones</h3>
          {conversations.length > 0 ? (
            <div className="conversations-list">
              {conversations.map(conv => (
                <div 
                  key={conv.user}
                  className={`conversation-item ${activeConversation === conv.user ? 'active' : ''}`}
                  onClick={() => setActiveConversation(conv.user)}
                >
                  <div className="conversation-avatar-container">
                    <img 
                      src={conv.avatar} 
                      alt={conv.displayName || 'Usuario'} 
                      className="conversation-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="conversation-name">
                        {conv.displayName || conv.user}
                      </span>
                      {conv.lastMessageTime && (
                        <span className="conversation-time">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    <div className="conversation-preview">
                      {conv.lastMessage?.length > 30 
                        ? `${conv.lastMessage.substring(0, 30)}...` 
                        : conv.lastMessage || 'Nuevo mensaje'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-conversations">
              <p>No hay conversaciones</p>
              <p className="small">Inicia una nueva conversación desde el perfil de un contacto</p>
            </div>
          )}
        </div>
        
        <div className="messages-container">
          {activeConversation ? (
            <>
              <h2>Conversación con {activeConversation}</h2>
              {renderMessages()}
            </>
          ) : (
            <div className="select-conversation">
              <p>Selecciona una conversación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesDashboard;