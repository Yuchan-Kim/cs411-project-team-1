const express = require('express');
const axios = require('axios');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const PORT = 3001;

// OAuth Dependencies
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

//Initialize session and passport
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('DB CONNECTED'))
  .catch((err) => console.log('DB CONNECTION ERROR', err));

// Setting up the database 
const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  googleId: String,
  imageUrl: String,
  savedVideos: [{ url: String }], // Add this line
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3001/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      scope: ["profile", "email"],
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        { googleId: profile.id },
        {
          username: profile.id,
          name: profile.displayName,
          imageUrl: profile.photos ? profile.photos[0].value : "",
        },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Enable CORS

app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post('/', async (req, res) => {
  const { searchTerm } = req.body;
  console.log('Search Term:', searchTerm); // Log the searchTerm to the console

  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(searchTerm)}&type=video&key=${process.env.YOUTUBE_API_KEY}`);
    const videoIds = response.data.items.map((item) => item.id.videoId);
    res.json({ videoIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve videos' });
  }
});

app.post('/generate', async (req, res) => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=10&key=${process.env.YOUTUBE_API_KEY}`);
    const videoIds = response.data.items.map((item) => item.id);
    res.json({ videoIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve videos' });
  }
});
app.post('/random', async (req, res) => {
  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/randomword', { headers: { 'X-Api-Key': process.env.RANDOM_WORD_API_KEY } });
    const randomWord = response.data.word;
    console.log('Random Word:', randomWord);

    const youtubeResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(randomWord)}&type=video&key=${process.env.YOUTUBE_API_KEY}`);
    const videoIds = youtubeResponse.data.items.map((item) => item.id.videoId);
    res.json({ randomWord, videoIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve videos' });
  }
});

app.post("/save-video", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { videoUrl } = req.body;

  try {
    await User.findByIdAndUpdate(req.user.id, {
      $push: { savedVideos: { url: videoUrl } },
    });
    res.status(200).json({ message: "Video saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to save video" });
  }
});

app.get("/saved-videos", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ savedVideos: user.savedVideos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to fetch saved videos" });
  }
});


app.delete("/delete-video/:videoId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { videoId } = req.params;

  try {
    // Remove the video and return the updated user object
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { savedVideos: { _id: videoId } },
      },
      { new: true } // Return the updated user object
    );
    res.status(200).json({ message: "Video deleted successfully", savedVideos: updatedUser.savedVideos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to delete video" });
  }
});



app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000" }),
  function(req, res) {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET);
    res.cookie('token', token, { httpOnly: true });
    res.redirect("http://localhost:3000");
  }
);


app.get("/logout", function(req, res){
  req.logout(() => {
    res.clearCookie('token');
    res.redirect("http://localhost:3000/");
  });
});



// Route to start the Google OAuth2 login process
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


// Callback route for Google OAuth2 login
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000" }),
  function(req, res) {
    // Successful authentication, set JWT token in localStorage and redirect to homepage.
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET);
    res.cookie('token', token, { httpOnly: true });
    res.redirect("http://localhost:3000");
  }
);

app.get("/isAuthenticated", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      isAuthenticated: true,
      email: req.user.email,
      name: req.user.name,
      imageUrl: req.user.imageUrl, 
    });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
});



// Logout route
app.get("/logout", function(req, res){
  req.logout();
  res.clearCookie('token');
  res.redirect("http://localhost:3000/");
});



app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});