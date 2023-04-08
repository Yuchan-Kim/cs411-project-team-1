import logo from './logo.svg';
import './App.css';
import Search from './components/search';
import React, { useState, useEffect } from "react";
import LoginButton from './components/loginButton';
import axios from 'axios';

function App() {
  const [videoId, setVideoId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/user")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch((err) => console.log(err));
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const handleLogout = () => {
    fetch("http://localhost:3001/logout")
      .then((res) => res.json())
      .then(() => setUser(null))
      .catch((err) => console.log(err));
  };



  return (
    <div className="App">
      <header className="App-header">
        <p>
            <b>RandTube</b>
        </p>
        {videoId && (
          <iframe 
          src={`https://www.youtube.com/embed/${videoId}?autoplay=true`}
          frameborder='5'
          width={1920/2}
          height={1080/2}
          allow='autoplay; encrypted-media'
          allowfullscreen
          title='video'
        ></iframe>
        )}
        <Search setVideoId={setVideoId} />
      </header>
    </div>
  );
}

export default App;


/*
  <img src={logo} className="App-logo" alt="logo" />
  <a
    className="App-link"
    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    target="_blank"
    rel="noopener noreferrer"
  >
  </a>
*/