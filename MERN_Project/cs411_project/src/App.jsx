import React, { useState, useEffect} from 'react';
import axios from 'axios';




function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [videoIds, setVideoIds] = useState([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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
      setEmail(response.data.email);
      setName(response.data.name);
      setImageUrl(response.data.imageUrl); // Add this line
    } catch (error) {
      console.error("Error fetching authentication status:", error);
    }
  };


  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (event.target.name === 'search') {
      try {
        const response = await axios.post('http://localhost:3001', { searchTerm });
        setVideoIds([response.data.videoId]);
        setError('');
      } catch (error) {
        setVideoIds([]);
        setError('Video not found. Please enter a valid search term.');
      }
    } else if (event.target.name === 'generate') {
      try {
        const response = await axios.post('http://localhost:3001/generate');
        setVideoIds(response.data.videoIds);
        setError('');
      } catch (error) {
        setVideoIds([]);
        setError('Unable to generate videos.');
      }
    } else if (event.target.name === 'random') {
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
    <div>
      <nav>
        <h1>RandTube</h1>
        {!isAuthenticated ? (
          <a href="http://localhost:3001/auth/google">Login</a>
        ) : (
          <>
          {imageUrl && (
              <div>
                <img src={imageUrl} alt="Profile" width="100" height="100" />
              </div>
            )}
            <div>
              Name: {name}
            </div>
            
            <a href="http://localhost:3001/logout">Logout</a>
          </>
        )}
      </nav>
      <form onSubmit={handleFormSubmit} name="search">
        <input
          type="text"
          placeholder="Search for a YouTube video"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <form onSubmit={handleFormSubmit} name="generate">
        <button type="submit">Generate</button>
      </form>
      <form onSubmit={handleFormSubmit} name="random">
        <button type="submit">Random Video</button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {videoIds.length > 0 && (
        <div>
          {videoIds.map((videoId) => (
            <iframe
              key={videoId}
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Embedded YouTube video"
              allowFullScreen
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
