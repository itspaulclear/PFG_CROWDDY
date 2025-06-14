import React from 'react';
import { Link } from 'react-router-dom';
import GradientText from '../TextAnimations/GradientText/GradientText';
import './PrivPol.css';

const PrivPol = () => {
  return (
    <div className="privacy-container">
      <header className="privacy-header">
        <Link to="/log-in" className="back-link">Regresar</Link>
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={10}
          showBorder={false}
          className="gradient-text"
        >
          Política de Privacidad
        </GradientText>
      </header>
      
      <div className="privacy-content">
        <section>
          <h2>1. Responsable del Tratamiento</h2>
          <p><strong>Identidad:</strong> Crowddy S.L.<br/>
          <strong>Domicilio Social:</strong> Avenida de Américo Vespucio, 5, Edificio Cartuja 93, Bloque 2, 41092 Sevilla, España<br/>
          <strong>CIF:</strong> B12345678<br/>
          <strong>Email:</strong> privacy@crowddy.com<br/>
          <strong>Teléfono:</strong> +34 902 252 566<br/>
          <strong>Inscrita en el Registro Mercantil de Sevilla, Tomo 12.345, Folio 123, Sección 8, Hoja M-123456</strong></p>
        </section>

        <section>
          <h2>2. Finalidad del Tratamiento de Datos</h2>
          <p>En cumplimiento de lo dispuesto en el Reglamento (UE) 2016/679 General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos y garantía de los derechos digitales (LOPDGDD), le informamos que los datos personales recabados serán tratados con las siguientes finalidades:</p>
          <ul>
            <li>Gestión de usuarios registrados en la plataforma</li>
            <li>Prestación de los servicios ofrecidos a través de la web</li>
            <li>Envío de comunicaciones comerciales y promocionales (previa autorización)</li>
            <li>Análisis estadístico de uso de la plataforma</li>
            <li>Cumplimiento de obligaciones legales</li>
          </ul>
        </section>

        <section>
          <h2>3. Base Legal para el Tratamiento</h2>
          <p>La base legal para el tratamiento de sus datos es la siguiente:</p>
          <ul>
            <li><strong>Ejecución de un contrato:</strong> Para la gestión de usuarios y prestación de servicios</li>
            <li><strong>Consentimiento del interesado:</strong> Para el envío de comunicaciones comerciales</li>
            <li><strong>Interés legítimo:</strong> Para el envío de información sobre productos y servicios similares</li>
            <li><strong>Cumplimiento de obligaciones legales:</strong> Cuando sea necesario para dar cumplimiento a normativas aplicables</li>
          </ul>
        </section>

        <section>
          <h2>5. Destinatarios de los Datos</h2>
          <p>Sus datos podrán ser comunicados a:</p>
          <ul>
            <li>Entidades financieras para la gestión de cobros y pagos</li>
            <li>Proveedores de servicios que nos asisten en la prestación del servicio (alojamiento, mantenimiento, etc.)</li>
            <li>Fuerzas y Cuerpos de Seguridad del Estado en cumplimiento de obligaciones legales</li>
            <li>Otras empresas del grupo por razones de gestión interna</li>
          </ul>
          <p>No se realizarán transferencias internacionales de datos a países fuera del Espacio Económico Europeo sin su consentimiento previo.</p>
        </section>

        <section>
          <h2>6. Plazo de Conservación de los Datos</h2>
          <p>Los datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que se recabaron y para determinar las posibles responsabilidades que se pudieran derivar de dicha finalidad y del tratamiento de los datos. En general:</p>
          <ul>
            <li>Datos de clientes: Mientras se mantenga la relación contractual y, posteriormente, durante los plazos legales establecidos</li>
            <li>Datos de navegación: Hasta que el usuario revoque el consentimiento o ejerza su derecho de supresión</li>
            <li>Datos con obligación legal: Durante los plazos establecidos en la normativa aplicable</li>
          </ul>
        </section>

        <section>
          <h2>7. Ejercicio de Derechos</h2>
          <p>Los usuarios podrán ejercitar sus derechos de acceso, rectificación, supresión, portabilidad, limitación y oposición ante el responsable del tratamiento en la dirección de correo electrónico: privacy@crowddy.com, o por correo postal a la dirección indicada en el apartado 1, indicando como Asunto: "Ejercicio de Derechos LOPD".</p>
          <p>Para ejercer estos derechos, es necesario que acredite su identidad aportando fotocopia de su DNI o documento equivalente. Tiene derecho a presentar una reclamación ante la Autoridad de Control competente (Agencia Española de Protección de Datos) cuando no haya obtenido satisfacción en el ejercicio de sus derechos.</p>
        </section>

        <section>
          <h2>8. Medidas de Seguridad</h2>
          <p>Hemos implementado las medidas de seguridad técnicas y organizativas necesarias para garantizar la seguridad de sus datos personales y evitar su alteración, pérdida, tratamiento y/o acceso no autorizado, habida cuenta del estado de la tecnología, la naturaleza de los datos almacenados y los riesgos a que están expuestos, ya provengan de la acción humana o del medio físico o natural.</p>
          <p>Entre otras, se han establecido las siguientes medidas:</p>
          <ul>
            <li>Control de acceso a los datos</li>
            <li>Procedimientos de copias de seguridad</li>
            <li>Sistemas de detección de intrusiones</li>
            <li>Actualizaciones periódicas del sistema</li>
            <li>Encriptación de las comunicaciones</li>
          </ul>
        </section>

        <section>
          <h2>6. Tus Derechos</h2>
          <p>Puedes ejercer los siguientes derechos:</p>
          <ul>
            <li><strong>Acceso:</strong> conocer qué datos tenemos sobre ti</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos</li>
            <li><strong>Supresión:</strong> eliminar tus datos</li>
            <li><strong>Portabilidad:</strong> obtener una copia de tus datos</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento</li>
          </ul>
          <p>Para ejercer estos derechos, contacta con: <strong>privacy@crowddy.com</strong></p>
        </section>

        <section>
          <h2>7. Seguridad</h2>
          <p>Aplicamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado de contraseñas y acceso controlado a los sistemas.</p>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>Utilizamos cookies esenciales para el funcionamiento del sitio. Puedes gestionar tus preferencias de cookies en la configuración de tu navegador.</p>
        </section>

        <section>
          <h2>9. Contacto</h2>
          <p>Para cualquier consulta sobre esta política: <strong>privacy@crowddy.com</strong></p>
        </section>

        <section>
          <h2>9. Menores de Edad</h2>
          <p>Nuestros servicios están dirigidos a mayores de 16 años. No recabamos a sabiendas información personal de menores de dicha edad. Si eres padre/madre o tutor y crees que tu hijo/a nos ha proporcionado información personal, por favor contáctanos para solicitar su eliminación.</p>
        </section>

        <section>
          <h2>10. Redes Sociales</h2>
          <p>Si interactúas con nosotros a través de las redes sociales, ten en cuenta que la información que publiques (comentarios, fotos, etc.) podrá ser vista por otros usuarios. Te recomendamos revisar las políticas de privacidad de cada red social.</p>
        </section>

        <section>
          <h2>11. Modificaciones de la Política de Privacidad</h2>
          <p>Nos reservamos el derecho a modificar la presente política para adaptarla a novedades legislativas o jurisprudenciales. Se recomienda al usuario que la consulte periódicamente.</p>
          <p>Los cambios en esta política no afectarán a los datos personales para los que el usuario haya dado su consentimiento, salvo que se le notifique lo contrario.</p>
        </section>

        <section>
          <h2>12. Legislación Aplicable y Jurisdicción</h2>
          <p>Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o de las actividades en él desarrolladas, será de aplicación la legislación española, a la que se someten expresamente las partes, siendo competentes para la resolución de todos los conflictos derivados o relacionados con su uso los Juzgados y Tribunales de Madrid (España).</p>
        </section>

        <section>
          <h2>13. Contacto</h2>
          <p>Para cualquier consulta sobre esta política de privacidad o para ejercer tus derechos, puedes contactar con nosotros a través de:</p>
          <p>
            <strong>Email:</strong> privacy@crowddy.com<br/>
            <strong>Dirección Postal:</strong> Avenida de Américo Vespucio, 5, Edificio Cartuja 93, Bloque 2, 41092 Sevilla, España<br/>
            <strong>Teléfono:</strong> +34 902 252 566
          </p>
          <p>Horario de atención al cliente: De lunes a viernes de 9:00 a 18:00 horas (hora peninsular española).</p>
        </section>

        <p className="update-date">
          <em>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</em>
        </p>
      </div>
    </div>
  );
};

export default PrivPol;