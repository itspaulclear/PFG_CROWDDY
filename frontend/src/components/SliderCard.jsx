import { useState } from "react";
import "./SliderCard.css";

const slides = [
  { 
    title: "Bienvenido", 
    content: "¿Necesitas algo? Obtén puntos por ayudar a tus vecinos y contribuye a tu comunidad. ¡Sin dinero, solo conexiones auténticas! 💫", 
    additional: "" 
  },
  { 
    title: "Así funciona", 
    content: (
      <ul>
        <li><strong>Publica una necesidad:</strong> Desde regar plantas, prestar herramientas o ayudar con una mudanza, comparte lo que necesites.</li>
        <li><strong>Colabora y gana puntos:</strong> Responde a peticiones de tus vecinos y acumula puntos por cada favor que hagas.</li>
        <li><strong>Alcanza los mejores puestos del ranking:</strong> Realiza favores para conseguir beneficios para tu comunidad.</li>
      </ul>
    ),
    additional: "" 
  },
  {
    title: "Novedades",
    content: "Descubre las próximas actualizaciones y mejoras que estamos preparando para ti. Mantente informado sobre nuevas funciones, optimizaciones y cambios que harán tu experiencia aún mejor.",
    additional: "Actualmente en versión Beta. ¡Explora lo nuevo!"
  },
  {
    title: "Normas de la comunidad",
    content: (
      <ul>
        <li><strong>Respeto y amabilidad:</strong> Trata a los demás con cortesía y empatía en todo momento.</li>
        <li><strong>Compromiso con los favores:</strong> Si ofreces tu ayuda, asegúrate de cumplir con lo prometido.</li>
        <li><strong>Prohibido el intercambio de dinero:</strong> La plataforma se basa en la solidaridad, no en pagos en efectivo.</li>
        <li><strong>Reporta comportamientos inapropiados:</strong> Si ves actividad sospechosa, notifícalo para mantener un entorno seguro.</li>
      </ul>
    ),
    additional: ""
  }
];

const SliderCard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => setIsExpanded(false);
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <>
      <div
        className={`slider-card ${isExpanded ? 'expanded' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="slider-layout">
          <div className="slider-text-content">
            <div className={`slider-content ${currentSlide === 1 ? "second-slide" : currentSlide === 2 ? "third-slide" : currentSlide === 3 ? "fourth-slide" : ""}`}>
              <h3>{slides[currentSlide].title}</h3>
              <p>{slides[currentSlide].content}</p>
            </div>

            <div className={`additional-section ${isExpanded ? 'visible' : ''}`}>
              {slides[currentSlide].additional && (
                <p 
                  className="additional-text"
                  onClick={currentSlide === 2 ? handleModalOpen : undefined}
                >
                  {slides[currentSlide].additional}
                </p>
              )}
            </div>

            <div className="slider-dots">
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  className={`slider-dot ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          </div>

          <div className={`slider-image ${currentSlide !== 0 ? 'no-image' : ''}`}>
            {currentSlide === 0 && <img src="./login/cover.jpeg" alt="cover" />}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Más información sobre la Beta</h2>
            <p>Estamos trabajando en mejoras continuas. Estas son algunas de las novedades que estamos desarrollando:</p>
            <table className="tableLogin">
              <thead>
                <tr>
                  <th className="thLogin">Actualización</th>
                  <th className="thLogin">Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="tdLogin">1️⃣</td>
                  <td className="tdLogin">Nueva interfaz de usuario optimizada</td>
                </tr>
                <tr>
                  <td className="tdLogin">2️⃣</td>
                  <td className="tdLogin">Mejoras en la experiencia de navegación</td>
                </tr>
                <tr>
                  <td className="tdLogin">3️⃣</td>
                  <td className="tdLogin">Nuevas funcionalidades para los usuarios</td>
                </tr>
                <tr>
                  <td className="tdLogin">4️⃣</td>
                  <td className="tdLogin">Corrección de errores y optimización del rendimiento</td>
                </tr>
              </tbody>
            </table>
            <button onClick={handleModalClose} className="buttonModal">Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default SliderCard;
