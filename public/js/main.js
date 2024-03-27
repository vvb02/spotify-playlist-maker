const loginBtn = document.querySelector("#login-btn");
const loginPage = document.querySelector("#login-section");
const homePage = document.querySelector("#input-section");
let userIsAuthenticated = false;
const genreGenerate = document.querySelector("#submit-btn");
const genreSection = document.querySelector("#genre-section");
const showMoreSection = document.querySelector(".show-more");
const showMoreBtn = document.querySelector("#show-more-btn");
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
        console.log("User is logged in");
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
      showMoreSection.style.display = "flex";
      genresArray = data.genres;
      displayTwentyGenres(genresArray);
    })
    .catch((error) => console.error("Error fetching genres: ", error));
};

//display Genres

let clickCounter = 0;
const numofGenres = 21;
function displayTwentyGenres(array) {
  const startGenre = clickCounter * numofGenres;
  const lastGenre = startGenre + numofGenres;
  const nextGenres = array.slice(startGenre, lastGenre);
  console.log(clickCounter);

  nextGenres.forEach((genre) => {
    const genreBtn = document.createElement("button");
    genreBtn.setAttribute("id", "genre-btn");
    let btnColor = colorPalette[Math.floor(Math.random() * 17)];
    genreBtn.style.background = `${btnColor}`;
    genreBtn.innerText = `${genre}`;
    genreSection.appendChild(genreBtn);
  });
  clickCounter++;

  if (clickCounter == 6) {
    showMoreBtn.style.display = "none";
  }
}

// show more genres
showMoreBtn.addEventListener("click", function () {
  displayTwentyGenres(genresArray);
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
