require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
const fetch = require("node-fetch"); // include node-fetch to make HTTP requests

const PORT = 3000;
const AUTHORIZE_URI = "https://accounts.spotify.com/authorize";
const SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/callback";
const TOKEN_URI = "https://accounts.spotify.com/api/token";

const generateRandomString = (length) => {
  let string = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+=-`,./";
  let count = 0;
  while (count < length) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
    count++;
  }
  return string;
};

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/auth/status", (req, res) => {
  if (req.cookies.access_token && req.session.userId) {
    res.json({ isAuthenticated: true, userId: req.session.userId });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.get("/login", (req, res) => {
  // Redirect the user to Spotify's authorization page
  let state = generateRandomString(16);
  req.session.state = state;
  const encodedState = encodeURIComponent(state);

  res.redirect(
    `${AUTHORIZE_URI}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(SCOPES)}&state=${encodedState}`
  );
});

app.get("/callback", async (req, res) => {
  const { code, state } = req.query;
  console.log("state" + state);
  console.log("req.session.state" + req.session.state);
  if (state !== req.session.state) {
    console.log("state" + state);
    console.log("req.session.state" + req.session.state);
    return res.status(500).send("State mismatch");
  }
  try {
    // Request access token from Spotify
    const response = await fetch(TOKEN_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    // Check if access token was successfully obtained
    if (data.access_token) {
      // Store access token and refresh token in cookies
      res.cookie("access_token", data.access_token, { httpOnly: true });
      res.cookie("refresh_token", data.refresh_token, { httpOnly: true });
      // Fetch user Spotify ID
      const userDataResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      const userData = await userDataResponse.json();

      // Store user spotify ID in the session
      req.session.userId = userData.id;

      // Redirect to another route to perform more actions (test)
      res.redirect(`http://localhost:3000/index.html`);
    } else {
      res.send("Error obtaining access token");
    }
  } catch (error) {
    res.send("An error occurred: " + error.message);
  }
});

app.get("/getGenres", async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No access token provided" });
  }
  try {
    const genresResponse = await fetch(
      "https://api.spotify.com/v1/recommendations/available-genre-seeds",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await genresResponse.json();
    res.send(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch genres",
      error: error.message,
    });
  }
});

app.post("/getRecommendations", async (req, res) => {
  const genres = req.body.genres.join(",");
  const userId = req.body.userId;

  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No access token provided" });
  }
  try {
    //Get tracks from genre(s)
    const recommendations = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=5&market=US&seed_genres=${encodeURIComponent(
        genres
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    const recommendationsData = await recommendations.json();

    //Create a new (empty) playlist
    const createPlaylist = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Playlist",
          description: "New playlist description",
          public: false,
        }),
      }
    );
    const playlistData = await createPlaylist.json();

    const playlistId = playlistData.id;

    const trackUris = recommendationsData.tracks.map((track) => track.uri); // Create new array for track uri's

    // Add tracks to playlist
    const addTrackstoPlaylist = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: trackUris }),
      }
    );

    // NEXT: Display playlist image, track images, and link to playlist on UI
    // Fix state mismatch error <.>
    res.send(addTrackstoPlaylist);
  } catch (error) {
    res.status(500).json({
      message: "Failed to add tracks to playlist",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
