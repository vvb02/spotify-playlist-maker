const loginBtn = document.querySelector("#login-btn");
const loginPage = document.querySelector("#login-section");
let userIsAuthenticated = false;
const genreSection = document.querySelector("#genre-section");
const controlsSection = document.querySelector("#controls-section");
const showMoreBtn = document.querySelector("#show-more-btn");
const generateBtn = document.querySelector("#generate-btn");
const playlistSection = document.querySelector("#playlist-items");
const descriptionEl = document.querySelector(".description");
const playlistCoverEl = document.querySelector(".playlist-cover");
const playlistDetailsEl = document.querySelector(".playlist-details");
const playlistTypeEl = document.querySelector(".playlist-type");
const playlistNameEl = document.querySelector(".playlist-name");
const playlistDescriptionEl = document.querySelector(".playlist-description");
const tracksContainer = document.querySelector(".playlist-tracks");

let selectedGenres = [];
let userId;

const colorPalette = [
  "#A83326",
  "#CA4334",
  "#884FA1",
  "#7C3C99",
  "#2570A3",
  "#2F86C0",
  "#16A489",
  "#138C74",
  "#239955",
  "#28B463",
  "#D4AD0C",
  "#D68910",
  "#CB6E1E",
  "#BB4B00",
  "#707B7C",
  "#2E4053",
  "#263747",
  "#839192",
];
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
});

const checkAuthStatus = () => {
  fetch("http://localhost:3000/auth/status")
    .then((response) => response.json())
    .then((data) => {
      if (data.isAuthenticated) {
        userIsAuthenticated = true;
        userId = data.userId; // Assign the userId from the server response to the variable
        console.log("User is logged in with ID:", userId);
        updateUI(true);
      } else {
        console.log("User is NOT logged in");
        updateUI(false);
      }
      getGenres();
    })
    .catch((error) => console.error("Error checking auth status:", error));
};

let genresArray = [];
const getGenres = () => {
  fetch("http://localhost:3000/getGenres", {
    headers: { "Content-Type": "application/json" },
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      controlsSection.style.display = "flex";
      genresArray = data.genres;
      displayTwentyGenres(genresArray);
    })
    .catch((error) => console.error("Error fetching genres: ", error));
};

let clickCounter = 0;
let selectedCounter = 0;
const numofGenres = 21;

function displayTwentyGenres(array) {
  const startGenre = clickCounter * numofGenres;
  const lastGenre = startGenre + numofGenres;
  const nextGenres = array.slice(startGenre, lastGenre);

  nextGenres.forEach((genre) => {
    // create and append button
    const genreBtn = document.createElement("button");
    genreBtn.setAttribute("class", "genre-btn");
    genreBtn.setAttribute("genre", `${genre}`);
    let btnColor = colorPalette[Math.floor(Math.random() * 17)];
    genreBtn.style.background = `${btnColor}`;
    genreBtn.innerText = `${genre}`;
    genreSection.appendChild(genreBtn);

    // add/remove genres from selected genres
    genreBtn.addEventListener("click", () => {
      if (genreBtn.classList.contains("selected-genre")) {
        genreBtn.classList.remove("selected-genre");
        selectedGenres = selectedGenres.filter(
          (e) => e !== `${genreBtn.getAttribute("genre")}`
        ); //filter through array and remove it
        selectedCounter--;
      } else if (
        selectedCounter < 5 &&
        !genreBtn.classList.contains("selected-genre")
      ) {
        selectedCounter++;
        genreBtn.classList.add("selected-genre");
        selectedGenres.push(genreBtn.getAttribute("genre"));
      } else if (
        selectedCounter == 5 &&
        !genreBtn.classList.contains("selected-genre")
      ) {
        console.log("im disabled!");
      }
    });
  });
  clickCounter++;
  if (clickCounter == 6) {
    showMoreBtn.style.display = "none";
  }
}

function createPlaylist(selectedGenres, userId) {
  fetch("http://localhost:3000/getRecommendations", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({ genres: selectedGenres, userId: userId }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      displayPlaylistInfo(
        data.playlistCover,
        data.trackImages,
        data.trackNames
      );
    })
    .catch((error) => console.error("Error fetching tracks: ", error));
}

function displayPlaylistInfo(playlistCover, trackImages, trackNames) {
  playlistSection.style.display = "block";
  genreSection.style.display = "none";
  controlsSection.style.display = "none";
  tracksContainer.style.display = "grid";
  playlistDetailsEl.style.display = "flex";
  descriptionEl.textContent = "Your personalized playlist is ready! ";

  playlistCoverEl.src = playlistCover;

  trackImages.forEach((image, index) => {
    const trackDiv = document.createElement("div");
    trackDiv.setAttribute("class", "track-info");

    const trackImageEl = document.createElement("img");
    trackImageEl.setAttribute("class", "track-image");
    trackImageEl.src = image;
    trackDiv.appendChild(trackImageEl);

    const trackNameEl = document.createElement("p");
    trackNameEl.setAttribute("class", "track-name");
    trackNameEl.textContent = trackNames[index];
    trackDiv.appendChild(trackNameEl);
    tracksContainer.appendChild(trackDiv);
  });
}

// show more genres
showMoreBtn.addEventListener("click", function () {
  displayTwentyGenres(genresArray);
});

// generate playlist
generateBtn.addEventListener("click", function () {
  if (selectedGenres.length < 1) {
    console.log("please select atleast one genre!");
  } else {
    createPlaylist(selectedGenres, userId);
  }
});

//user login
loginBtn.addEventListener("click", () => {
  location.assign("http://localhost:3000/login");
  checkAuthStatus();
});

//LATER - adjust how different displays appear (ex. so it can't be changed easily in devtools)
const updateUI = (isAuthenticated) => {
  // Using userIsAuthenticated to control UI elements
  if (isAuthenticated) {
    // Show authenticated user interface
    loginPage.style.display = "none";
    genreSection.style.display = "flex";
  } else {
    // Show login button
    loginPage.style.display = "flex";
    genreSection.style.display = "none";
  }
};
