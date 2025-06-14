import React, { useState, useEffect } from 'react';
import 'font-awesome/css/font-awesome.min.css'; 
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import './Administrator.css';

function Administrador() {
  const [usuarios, setUsuarios] = useState([]); 
  const [filteredUsuarios, setFilteredUsuarios] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const [searchField, setSearchField] = useState('username'); 
  const [searchTerm, setSearchTerm] = useState('');  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const navigate = useNavigate();  

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:8080/method/get');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        setUsuarios(data);
        setFilteredUsuarios(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los usuarios');
        setLoading(false);
      }
    };

    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsuarios(usuarios);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = usuarios.filter(user => {
        const fieldValue = String(user[searchField] || '').toLowerCase();
        return fieldValue.includes(searchTermLower);
      });
      setFilteredUsuarios(filtered);
    }
  }, [searchTerm, searchField, usuarios]);

  const handleDelete = async (usernameToDelete) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${usernameToDelete}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/method/delete/${encodeURIComponent(usernameToDelete)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        responseData = { message: responseText };
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Error al eliminar el usuario');
      }
      
      setUsuarios(prevUsuarios => {
        const updated = prevUsuarios.filter(user => user.username !== usernameToDelete);
        return updated;
      });
      
      setFilteredUsuarios(prev => prev.filter(user => user.username !== usernameToDelete));
      
      toast.success(responseData.message || `Usuario ${usernameToDelete} eliminado correctamente`);
      
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      toast.error(error.message || 'No se pudo eliminar el usuario');
    }
  };

  const handleEdit = (user) => {
    const userId = user.id || (Array.isArray(user) ? user[0] : null);
    
    const userArray = [
      userId, 
      null,
      user.birthday || '',
      null,
      null, 
      null, 
      user.name || '',
      '',
      user.surname || '',
      user.username || '',
      user.interests || ''
    ];
    
    localStorage.setItem('userToEdit', JSON.stringify(userArray));  
    navigate('/editor');
  };

  return (
    <div className="table-container">
      <div className="administrador-buttons">
        <Link to="/log-in"><button className="administrador-back-button">Regresar</button></Link>
        <Link to="/sign-up"><button className="administrador-register-button">Añadir nuevo usuario</button></Link>
        <div className="search-administrator-container">
          <div className='search-administrator-content'>
            <select 
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="username">Nombre de usuario</option>
              <option value="name">Nombre</option>
              <option value="surname">Apellidos</option>
              <option value="birthday">Fecha de nacimiento</option>
            </select>
            <input
              type="text"
              placeholder={`Buscar por ${getFieldLabel(searchField)}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-administrator-input"
            />
          </div>
        </div>
      </div>
      <h2 className="administrador-title">Lista de Crowddiers</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {usuarios.length === 0 ? (
        <p>No hay usuarios disponibles.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Nombre de Usuario</th>
              <th>Contraseña</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Fecha de nacimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((user, index) => (
              <tr key={index}>
                <td>{user.username}</td>
                <td>{user.password}</td>
                <td>{user.name}</td>
                <td>{user.surname}</td>
                <td>{user.birthday}</td>
                <td>
                  <button 
                    className="button-action button-edit"
                    onClick={() => handleEdit(user)}
                  >
                    <i className="fa fa-edit"></i> 
                  </button>
                  <button 
                    className="button-action button-delete"
                    onClick={() => handleDelete(user.username)}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filteredUsuarios.length > 0 && (
        <div className="pagination-controls">
          <div className="items-per-page-container">
            <span htmlFor="itemsPerPage">Elementos por página: </span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="pagination-buttons">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
            >
              {'<<'}
            </button>
            <span> Página {currentPage} de {Math.ceil(filteredUsuarios.length / itemsPerPage)} </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsuarios.length / itemsPerPage)))} 
              disabled={currentPage === Math.ceil(filteredUsuarios.length / itemsPerPage)}
            >
              {'>>'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const getFieldLabel = (field) => {
  const labels = {
    username: 'nombre de usuario',
    name: 'nombre',
    surname: 'apellidos',
    birthday: 'fecha de nacimiento (YYYY-MM-DD)'
  };
  return labels[field] || field;
};

export default Administrador;
