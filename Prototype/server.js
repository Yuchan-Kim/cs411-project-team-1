const express = require('express');
//const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = ""
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
const session = require('express-session');

app.use(cors()); // Enable CORS

app.get('/search', async (req, res) => {
  searchTerm = req.query.q;
  console.log("search call requested with query " + searchTerm)
  try {
    if (searchTerm == "")
    {
        const randWordResponse = await fetch("https://random-word-api.herokuapp.com/word")
        const randWord = await randWordResponse.json();
        console.log("generated random query: " + randWord[0]);
        searchTerm = randWord;
    }
    const url = "https://www.googleapis.com/youtube/v3/search?" + "key=" + API_KEY + "&part=snippet&channelType=any&maxResults=1&order=relevance&safeSearch=none&type=video&videoDefinition=any&videoDuration=any&videoEmbeddable=true&videoLicense=any&videoSyndicated=any" + "&q=" + searchTerm + "&type=video";
    //Potential for relatedToVideoId to be used?
    console.log(url)
    const response = await fetch(url);
    const data = await response.json();
    //console.log(response)
    const videoId = data.items[0].id.videoId;
    console.log("Generated video id:" + videoId);
    res.json({ videoId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve video' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

//OAuth Implementation
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
  }));

app.use(passport.initialize());
app.use(passport.session());

// Define the Google OAuth2.0 strategy