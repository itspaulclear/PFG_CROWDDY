import React from 'react';
import './Testimonies.css';
import { Link } from 'react-router-dom';

function Testimonios() {
  return (
    <div className="gallery-container">
      <div className="testimonial-card testimonial-header">
        <div className="user-info">
          <div className="user-details">
            <h2>Testimonios de nuestros Crowddiers</h2>
            <p>Descubre cómo Crowddy está mejorando la vida de la comunidad.</p>
            <Link to="/log-in"><button className="testimonial-button">Regresar</button></Link>
          </div>
        </div>
      </div>

      <div className="testimonial-card">
        <div className="user-info">
          <img className="avatar" src="./testimonios/person2.jpg" alt="Avatar" />
          <div className="user-details">
            <h4>Juan P.</h4>
            <p>@juanp</p>
          </div>
        </div>
        <p className="testimonial-text">"Crowddy me ha ayudado a conocer a mis vecinos de una manera diferente. Me he sentido muy cómodo usando este servicio y he recibido ayuda cuando más lo necesitaba. ¡Es genial!"</p>
        <div className="tweet-stats">
          <span className="likes">❤️ 45</span>
          <span className="retweets">🔁 18</span>
          <span className="time">Hace más de un mes</span>
        </div>
      </div>

      <div className="testimonial-card">
        <div className="user-info">
          <img className="avatar" src="./testimonios/person1.jpg" alt="Avatar" />
          <div className="user-details">
            <h4>Ana G.</h4>
            <p>@ana_g</p>
          </div>
        </div>
        <p className="testimonial-text">"Nunca me imaginé que podría intercambiar favores sin dinero de por medio. Definitivamente, Crowddy hace que la vida en comunidad sea más sencilla."</p>
        <div className="tweet-stats">
          <span className="likes">❤️ 38</span>
          <span className="retweets">🔁 10</span>
          <span className="time">Hace más de un mes</span>
        </div>
      </div>

      <div className="testimonial-card">
        <div className="user-info">
          <img className="avatar" src="./testimonios/person3.jpg" alt="Avatar" />
          <div className="user-details">
            <h4>Carlos M.</h4>
            <p>@carlos_m</p>
          </div>
        </div>
        <p className="testimonial-text">"Crowddy me ha permitido ayudar a mis vecinos y también recibir ayuda sin complicaciones. Estoy deseando que siga creciendo y mejorando."</p>
        <div className="tweet-stats">
          <span className="likes">❤️ 50</span>
          <span className="retweets">🔁 22</span>
          <span className="time">Hace más de un mes</span>
        </div>
      </div>

      <div className="testimonial-card">
        <div className="user-info">
          <img className="avatar" src="./testimonios/person4.jpg" alt="Avatar" />
          <div className="user-details">
            <h4>Lucía T.</h4>
            <p>@lucia_t</p>
          </div>
        </div>
        <p className="testimonial-text">"Un sistema fácil de entender y sin complicaciones que me ha permitido hacer favores sin pensar en dinero. Lo recomiendo a todos mis vecinos."</p>
        <div className="tweet-stats">
          <span className="likes">❤️ 42</span>
          <span className="retweets">🔁 15</span>
          <span className="time">Hace más de un mes</span>
        </div>
      </div>

      <div className="testimonial-card">
        <div className="user-info">
          <img className="avatar" src="./public/testimonios/person5.jpg" alt="Avatar" />
          <div className="user-details">
            <h4>Roberto D.</h4>
            <p>@roberto_d</p>
          </div>
        </div>
        <p className="testimonial-text">"Crowddy me ha ayudado a involucrarme más con la comunidad. Es un sistema que motiva a ayudar sin esperar nada a cambio. Estoy muy contento con la experiencia."</p>
        <div className="tweet-stats">
          <span className="likes">❤️ 40</span>
          <span className="retweets">🔁 17</span>
          <span className="time">Hace más de un mes</span>
        </div>
      </div>

      <div className="testimonial-card">
        <div className="user-info">
          <img className="avatar" src="./testimonios/person6.jpg" alt="Avatar" />
          <div className="user-details">
            <h4>María R.</h4>
            <p>@maria_r</p>
          </div>
        </div>
        <p className="testimonial-text">"Lo que más me gusta de Crowddy es la simplicidad del sistema. He hecho favores y he recibido ayuda sin necesidad de dinero. Todo es mucho más fluido."</p>
        <div className="tweet-stats">
          <span className="likes">❤️ 33</span>
          <span className="retweets">🔁 12</span>
          <span className="time">Hace más de un mes</span>
        </div>
      </div>

      <div className="testimonial-card">
        <div className="user-info">
          <img className="avatar" src="./testimonios/person7.jpg" alt="Avatar" />
          <div className="user-details">
            <h4>Andrés V.</h4>
            <p>@andres_v</p>
          </div>
        </div>
        <p className="testimonial-text">"Crowddy ha hecho que la vida en el vecindario sea más fácil. Me ha permitido ayudar a otros y recibir favores a cambio, sin complicaciones. ¡Una gran idea!"</p>
        <div className="tweet-stats">
          <span className="likes">❤️ 36</span>
          <span className="retweets">🔁 14</span>
          <span className="time">Hace más de un mes</span>
        </div>
      </div>
      <div className="testimonial-card">
        <h1 className="testimonial-text">Regístrate gratis</h1>
        <p>No te llevará más tiempo del que tardas en saludar a tu vecino en el portal.</p>
        <Link to="../sign-up"><button className="register-testimonial-button">Me interesa</button></Link>
      </div>
    </div>
  );
}

export default Testimonios;
