import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveVideo } from './saveVideo';
import './App.css';


function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [videoIds, setVideoIds] = useState([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [savedVideos, setSavedVideos] = useState(['search']);
  const [currentSection, setCurrentSection] = useState('trending');


  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await axios.get("http://localhost:3001/isAuthenticated", {
        withCredentials: true,
      });
      console.log("Authentication response:", response.data);
      setIsAuthenticated(response.data.isAuthenticated);
      setName(response.data.name);
      setImageUrl(response.data.imageUrl); 
    } catch (error) {
      console.error("Error fetching authentication status:", error);
    }
  };

  const fetchSavedVideos = async () => {
    if (!isAuthenticated) return;
  
    try {
      const response = await axios.get("http://localhost:3001/saved-videos", {
        withCredentials: true,
      });
      setSavedVideos(response.data.savedVideos);
      setCurrentSection('saved'); // Update the current section to 'saved'
    } catch (error) {
      console.error("Error fetching saved videos:", error);
      setError("Unable to fetch saved videos.");
    }
  };
  async function deleteVideo(videoId) {
    try {
      const response = await fetch(`http://localhost:3001/delete-video/${videoId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (response.status === 200) {
        const data = await response.json();
        alert("Video deleted successfully");
        // Update the saved videos list with the new data from the server
        setSavedVideos(data.savedVideos);
      } else {
        alert("Error deleting video");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting video");
    }
  }
  
  
  const handleFormSubmit = async (event, action) => {
  event.preventDefault();

  setCurrentSection('trending'); // Update the current section to 'trending'

  if (action === 'search') {
    try {
      const response = await axios.post('http://localhost:3001', { searchTerm });
      setVideoIds([response.data.videoIds]);
      setError('');
    } catch (error) {
      setVideoIds([]);
      setError('Video not found. Please enter a valid search term.');
    }
  } else if (action === 'generate') {
    try {
      const response = await axios.post('http://localhost:3001/generate');
      setVideoIds(response.data.videoIds);
      setError('');
    } catch (error) {
      setVideoIds([]);
      setError('Unable to generate videos.');
    }
  } else if (action === 'random') {
    try {
      const response = await axios.post('http://localhost:3001/random');
      setVideoIds(response.data.videoIds);
      setError('');
    } catch (error) {
      setVideoIds([]);
      setError('Unable to generate random video.');
    }
  }
};

  
  return (
    <div className="container">
  <header>
    <h1>RandTube</h1>
    <nav>
      {!isAuthenticated ? (
        <>
          <button onClick={() => (window.location.href = 'http://localhost:3001/auth/google')}>
            My Account
          </button>
        </>
      ) : (
        <div className="user-info">
  <div className="profile-image">
    <img src={imageUrl} alt="Profile" />
  </div>
  <div className="user-details">
    <h3>{name}</h3>
    <div className="profile-actions">
      <button onClick={() => (window.location.href = 'http://localhost:3001/logout')}>
        Logout
      </button>
      <button onClick={fetchSavedVideos}>Saved Videos</button>
    </div>
  </div>
</div>

      )}
    </nav>
  </header>

  <div className="form-container">
    <form onSubmit={(e) => handleFormSubmit(e, 'generate')}>
      <button type="submit">TOP 10 Trending Videos</button>
    </form>

    {isAuthenticated && (
      <form onSubmit={(e) => handleFormSubmit(e, 'search')}>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for a YouTube video"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </div>
      </form>
    )}

    {isAuthenticated && (
      <form onSubmit={(e) => handleFormSubmit(e, 'random')}>
        <button type="submit">Random Video</button>
      </form>
    )}
  </div>

  

  {error && <div className="error-message">{error}</div>}
  {currentSection === 'trending' && videoIds.length > 0 && (
    <div className="main-content">
      {videoIds.map((videoId) => (
        <div key={videoId} className="card">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={`Video ${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          {isAuthenticated && (
            <div className="save-button">
              <button onClick={() => saveVideo(`https://www.youtube.com/watch?v=${videoId}`)}>
                Save
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )}

  {currentSection === 'saved' && savedVideos.length > 0 && (
    <div className="main-content">
      <h2>Saved Videos</h2>
      {savedVideos.map((video, index) => {
        const videoId = new URL(video.url).searchParams.get('v');
        return (
          <div key={index} className="card">
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`Video ${videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button onClick={() => deleteVideo(video._id)}>Delete</button>
          </div>
        );
      })}
    </div>
    
        )}
      </div>
  );
  
}  

export default App;

