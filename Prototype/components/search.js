import React, { useState } from "react";
import axios from 'axios';
export const videoId = "";
console.log(videoId)

const SearchBar = ({ setVideoId }) => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleButtonClick = async (event) => {
    event.preventDefault();
    
    try {
        const response = await fetch('http://localhost:3001/search?q=' + encodeURIComponent(query));
        console.log(response)
        const data = await response.json();
        setVideoId(data.videoId);
        console.log(data.videoId)
        setError('');
    } catch (error) {
        setVideoId(null);
        console.log(error)
        setError('Video not found. Please enter a valid search term.');
    }
  };

  return (
    <form>
      <label htmlFor="header-search">
        <span className="visually-hidden">Search blog posts</span>
      </label>
      <input
        type="text"
        id="header-search"
        placeholder="Query"
        name="s"
        value={query}
        onChange={handleInputChange}
      />
      <button type="submit" onClick={handleButtonClick}>
        Generate
      </button>
    </form>
  );
};

export default SearchBar;