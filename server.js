const express = require("express");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.static("public"));
const fetch = require("node-fetch"); // include node-fetch to make HTTP requests

const PORT = 3000;
const AUTHORIZE_URI = "https://accounts.spotify.com/authorize";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/callback";
const TOKEN_URI = "https://accounts.spotify.com/api/token";

app.get("/login", (req, res) => {
  // Redirect the user to Spotify's authorization page
  res.redirect(
    `${AUTHORIZE_URI}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`
  );
});

app.get("/callback", async (req, res) => {
  const code = req.query.code; // Get the authorization code from the query string
  try {
    // Request access token from Spotify
    const response = await fetch(TOKEN_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json(); // Parse JSON response

    // Check if access token was successfully obtained
    if (data.access_token) {
      // Store access token and refresh token in cookies
      res.cookie("access_token", data.access_token, { httpOnly: true });
      res.cookie("refresh_token", data.refresh_token, { httpOnly: true });

      // Redirect to another route to perform more actions
      res.redirect(`http://localhost:3000/getSongFromYear`);
    } else {
      res.send("Error obtaining access token");
    }
  } catch (error) {
    res.send("An error occurred: " + error.message);
  }
});

app.get("/getSongFromYear", async (req, res) => {
  const accessToken = req.cookies.access_token; // Get access token from cookies

  // Make request to Spotify API to get 5 songs from year 2000 (test)
  const response = await fetch(
    "https://api.spotify.com/v1/search?q=year%3A2000&type=track&market=US&limit=5&offset=0",
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken, // Use access token for authorization
      },
    }
  );

  const data = await response.json(); // Parse JSON response
  res.send(data); // Send data back to client
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
