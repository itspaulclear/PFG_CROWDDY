import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Explore.css';

const Explorar = () => {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const navigate = useNavigate();

  const categories = [
    {
      name: "🛠️ Reparaciones",
      items: [
        "Arreglo de grifo que gotea",
        "Reparación de electrodomésticos",
        "Arreglo de puertas y cerraduras",
        "Reemplazo de bombillas o luces",
        "Reparación de muebles rotos",
        "Reemplazo de una junta de baño",
        "Instalación de sistemas de agua",
        "Reparación de lavadoras",
        "Ajuste de puertas de armarios",
        "Arreglo de electrodomésticos a gas"
      ]
    },
    {
      name: "📦 Mudanzas",
      items: [
        "Traslado de muebles grandes",
        "Ayuda para empacar cajas",
        "Alquiler de vehículo para mudanza",
        "Desmontaje de muebles",
        "Traslado de objetos frágiles",
        "Desmontaje de electrodomésticos",
        "Traslado de cajas pesadas",
        "Mudanza de oficina",
        "Transporte de objetos a larga distancia",
        "Mudanza de objetos delicados"
      ]
    },
    {
      name: "🌱 Jardinería",
      items: [
        "Corte de césped",
        "Plantar flores o plantas",
        "Riego de plantas en vacaciones",
        "Reemplazo de tierra de macetas",
        "Recogida de hojas caídas",
        "Cuidado de plantas en invierno",
        "Poda de arbustos",
        "Fertilización de plantas",
        "Control de plagas",
        "Siembra de césped"
      ]
    },
    {
      name: "🍴 Cocina",
      items: [
        "Preparación de comida para una fiesta",
        "Asistencia en la cocina para cocinar platos especiales",
        "Recetas de cocina saludable",
        "Decoración de mesas para eventos",
        "Consejos para recetas vegetarianas",
        "Cocinar postres caseros",
        "Preparación de almuerzos saludables",
        "Asesoramiento sobre vinos",
        "Creación de menús para dietas especiales",
        "Consejos para recetas sin gluten"
      ]
    },
    {
      name: "🚲 Transporte",
      items: [
        "Traslado de bicicletas a un taller",
        "Ayuda para cargar en un coche",
        "Asistencia con el transporte de mascotas",
        "Compartir viajes para eventos",
        "Traslado de objetos grandes",
        "Transporte de bicicletas largas distancias",
        "Traslado de vehículos pequeños",
        "Transporte de animales en jaulas",
        "Compartir vehículos para eventos",
        "Transporte de carga pesada"
      ]
    }
  ];

  return (
      <div className="explorar-container">
      <div className="banner-title">
        <h1 className="title-explorar">Explorar</h1>
      </div>
      <button className="back-explorar" onClick={() => navigate('/log-in')}>Regresar</button>
      <div className="recuadro-central">
        <div className="caja-categorias">
          {categories.map((category, index) => (
            <div
              key={index}
              className="categoria-item"
              onClick={() => setSelectedCategoryIndex(index)}
            >
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>

        <div className="detalle-categoria">
          <h3>{categories[selectedCategoryIndex].name}</h3>
          <ol className="list-explore">
            {categories[selectedCategoryIndex].items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Explorar;
