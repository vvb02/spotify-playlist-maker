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
const modal = document.querySelector(".edit-details-modal");
const closeBtn = document.querySelector(".modal-close-button");
const modalBkg = document.querySelector(".modal-background");
const saveBtn = document.querySelector(".save-button");
const playlistMeta = document.querySelector(".playlist-meta");
const modalThumbnail = document.querySelector(".thumbnail");

const playBtnUrl = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="eSKqip8M09O1" viewBox="0 0 71 78" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><g transform="translate(-31.5-40.5)"><ellipse rx="22.5" ry="22.5" transform="translate(67 79.5)" fill="#1db954" stroke-width="0"/><polygon points="0,-40.116465 34.741878,20.058233 -34.741878,20.058233 0,-40.116465" transform="matrix(.216642-.135373 0.135373 0.216642 66.357674 79.672732)" stroke-width="0"/></g></svg>`;
const pauseBtnUrl = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="eMaJjO7QrCx1" viewBox="0 0 71 78" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><g transform="translate(-111.456848-98.884613)"><ellipse rx="22.5" ry="22.5" transform="translate(146.956842 137.884615)" fill="#1db954" stroke-width="0"/><rect width="4" height="21.205298" rx="1" ry="1" transform="translate(138.956842 127.281966)" stroke-width="0"/><rect width="4" height="21.205298" rx="1" ry="1" transform="translate(149.956842 127.281966)" stroke-width="0"/></g></svg>`;
let selectedGenres = [];
let userId;
let playlistId;

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
    controlsSection.style.display = "none";
  }
};

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
      console.log(data.responseData);
      displayPlaylistInfo(
        data.responseData.playlistCover,
        data.responseData.trackImages,
        data.responseData.trackNames,
        data.responseData.trackPreviewUrl
      );
      playlistId = data.playlistId;
      console.log(playlistId);
    })
    .catch((error) => console.error("Error fetching tracks: ", error));
}

let currentPlaylistCover;
let currentPlaylistName;
let currentPlaylistDescription;

function displayPlaylistInfo(
  playlistCover,
  trackImages,
  trackNames,
  trackPreview
) {
  playlistSection.style.display = "block";
  genreSection.style.display = "none";
  controlsSection.style.display = "none";
  tracksContainer.style.display = "grid";
  playlistDetailsEl.style.display = "flex";
  descriptionEl.textContent = "Your personalized playlist is ready! ";

  currentPlaylistCover = playlistCover;
  playlistCoverEl.src = playlistCover;
  modalThumbnail.src = playlistCover;

  trackImages.forEach((image, index) => {
    // Create track container
    const trackDiv = document.createElement("div");
    trackDiv.setAttribute("class", "track-container");
    trackDiv.setAttribute("data-index", index);

    // Place track image in container
    const trackImageEl = document.createElement("img");
    trackImageEl.setAttribute("class", "track-image");
    trackImageEl.src = image;
    trackDiv.appendChild(trackImageEl);

    // Place track name in container
    const trackNameEl = document.createElement("p");
    trackNameEl.setAttribute("class", "track-name");
    trackNameEl.textContent = trackNames[index];
    trackDiv.appendChild(trackNameEl);

    // Place track container onto page
    tracksContainer.appendChild(trackDiv);

    // Implement play/pause button
    const playPauseButton = document.createElement("button");
    playPauseButton.setAttribute("class", "play-pause-btn");
    playPauseButton.innerHTML = playBtnUrl;
    trackDiv.appendChild(playPauseButton);

    playPauseButton.addEventListener("click", (e) => {
      const audioPlayer = document.getElementById("preview-player");
      const trackIndex =
        e.currentTarget.parentElement.getAttribute("data-index");
      console.log(trackIndex);
      const isPlaying =
        audioPlayer.src === trackPreview[trackIndex] && !audioPlayer.paused;

      if (isPlaying) {
        audioPlayer.pause();
        e.currentTarget.innerHTML = playBtnUrl; // Change to play button
        e.currentTarget.parentElement
          .querySelector(".track-image")
          .classList.remove("playing");
      } else {
        document.querySelectorAll(".play-pause-btn").forEach((btn) => {
          btn.innerHTML = playBtnUrl; // Reset all buttons to play
          btn.parentElement
            .querySelector(".track-image")
            .classList.remove("playing");
        });

        audioPlayer.src = trackPreview[trackIndex];
        audioPlayer.play();
        e.currentTarget.innerHTML = pauseBtnUrl; // Change to pause button
        e.currentTarget.parentElement
          .querySelector(".track-image")
          .classList.add("playing");
      }
    });
  });
}

// Open modal function
function openModal() {
  modal.classList.add("active");
  modalBkg.classList.add("active");
}

// Close modal function
function closeModal() {
  modal.classList.remove("active");
  modalBkg.classList.remove("active");
}

function uploadImagePreview() {
  document
    .querySelector("#file-upload")
    .addEventListener("change", function (event) {
      let file = event.target.files[0];
      if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
          // playlistCoverEl.src = e.target.result;
          currentPlaylistCover = e.target.result;
          modalThumbnail.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        console.log("invalid image selection");
      }
    });
}

function editPlaylistDetails() {
  let playlistName = document.querySelector("#playlist-name-modal").value;
  let playlistDescription = document.querySelector(
    "#playlist-description-modal"
  ).value;
  // check if neither are empty
  playlistNameEl.textContent = `${playlistName}`;
  playlistDescriptionEl.textContent = `${playlistDescription}`;
  currentPlaylistName = playlistName;
  currentPlaylistDescription = playlistDescription;
}

function editPlaylistCover() {
  playlistCoverEl.src = currentPlaylistCover;
}

playlistDetailsEl.addEventListener("click", openModal);
playlistDetailsEl.addEventListener("click", function () {
  uploadImagePreview();
});

function updatePlaylistDetails(
  currentPlaylistCover,
  currentPlaylistName,
  currentPlaylistDescription
) {
  fetch("http://localhost:3000/updatePlaylistDetails", {
    headers: { "Content-Type": "application/json" },
    method: "PUT",
    body: JSON.stringify({
      cover: currentPlaylistCover,
      name: currentPlaylistName,
      description: currentPlaylistDescription,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) =>
      console.error("Error updating playlist details: ", error)
    );
}

closeBtn.addEventListener("click", closeModal);
// modalBkg.addEventListener("click", closeModal);

saveBtn.addEventListener("click", function (e) {
  e.preventDefault();
  editPlaylistCover();
  editPlaylistDetails();
  updatePlaylistDetails(
    currentPlaylistCover,
    currentPlaylistName,
    currentPlaylistDescription
  );
  closeModal();
});

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

// window.onload = function () {
//   uploadPreviewImage();
// };
