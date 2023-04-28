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
  const [savedVideos, setSavedVideos] = useState([]);
  const [activeSection, setActiveSection] = useState('trending');



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
    } catch (error) {
      console.error("Error fetching saved videos:", error);
      setError("Unable to fetch saved videos.");
    }
  };
  async function deleteVideo(videoId, fetchSavedVideos) {
    try {
      const response = await fetch(`http://localhost:3001/delete-video/${videoId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (response.status === 200) {
        alert("Video deleted successfully");
        fetchSavedVideos();
      } else {
        alert("Error deleting video");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting videodd");
    }
  }
  
  const handleFormSubmit = async (event, action) => {
    event.preventDefault();

    if (action === 'search') {
      try {
        const response = await axios.post('http://localhost:3001', { searchTerm });
        setVideoIds([response.data.videoId]);
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
  const handleSavedClick = () => {
    setActiveSection('saved');
    fetchSavedVideos();
  };
  return (
    <div className="container">
      <header>
        <h1>RandTube</h1>
        <nav>
          {!isAuthenticated ? (
            <>
              <button onClick={() => (window.location.href = 'http://localhost:3001/auth/google')}>
                Login
              </button>
              <button onClick={() => (window.location.href = 'http://localhost:3001/register')}>
                Register
              </button>
            </>
          ) : (
            <div className="user-info">
              <div className="profile-image">
                <img src={imageUrl} alt="Profile" width="100" height="100" />
              </div>
              <div className="user-details">
                <span>Name: {name}</span>
                <button onClick={() => (window.location.href = 'http://localhost:3001/logout')}>
                  Logout
                </button>
                <button onClick={fetchSavedVideos}>Saved Videos</button>
              </div>
            </div>
          )}
        </nav>
      </header>
  
      <div className="container">
        <form onSubmit={(e) => handleFormSubmit(e, 'generate')}>
          <button type="submit">TOP 10 Trending Videos</button>
        </form>
  
        {isAuthenticated && (
          <>
            <form onSubmit={(e) => handleFormSubmit(e, 'search')}>
              <input
                type="text"
                placeholder="Search for a YouTube video"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
            <form onSubmit={(e) => handleFormSubmit(e, 'random')}>
              <button type="submit">Random Video</button>
            </form>
          </>
        )}
  
        {error && <div className="error-message">{error}</div>}
        {videoIds.length > 0 && (
        <div className="main-content">
          {videoIds.map((videoId) => (
            <div key={videoId} className="card">
              <iframe
                title={videoId}
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allowFullScreen
              />
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
  
        {savedVideos.length > 0 && (
          <div className="main-content">
            <h2>Saved Videos</h2>
            {savedVideos.map((video, index) => {
              const videoId = new URL(video.url).searchParams.get('v');
              return (
                <div key={index} className="card">
                  <iframe
                    title={videoId}
                    src={`https://www.youtube.com/embed/${videoId}`}
                    frameBorder="0"
                    allowFullScreen
                  />
                  <button onClick={() => deleteVideo(video._id)}>Delete</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
  
}  

export default App;

