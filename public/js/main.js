const loginBtn = document.querySelector("#login-btn");
const loginPage = document.querySelector("#login-section");
const homePage = document.querySelector("#input-section");
let userIsAuthenticated = false;
const genreGenerate = document.querySelector("#submit-btn");
const genreSection = document.querySelector("#genre-section");
const controlsSection = document.querySelector("#controls-section");
const showMoreBtn = document.querySelector("#show-more-btn");
const generateBtn = document.querySelector("#generate-btn");
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
      genreSection.style.display = "flex";
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
    })
    .catch((error) => console.error("Error fetching tracks: ", error));
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
    homePage.style.display = "flex";
  } else {
    // Show login button
    loginPage.style.display = "flex";
    homePage.style.display = "none";
  }
};

genreGenerate.addEventListener("click", getGenres);
