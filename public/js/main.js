const loginBtn = document.querySelector("#login-btn");
const loginPage = document.querySelector("#login-section");
const homePage = document.querySelector("#input-section");
let userIsAuthenticated = false;
const userYear = document.querySelector("#year-input");
const submitBtn = document.querySelector("#submit-btn");

document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
});

function checkAuthStatus() {
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
}

//user login
loginBtn.addEventListener("click", () => {
  location.assign("http://localhost:3000/login");
  checkAuthStatus();
});

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

//continue
const getYear = () => {
  console.log(userYear.value);
};
submitBtn.addEventListener("click", getYear);
