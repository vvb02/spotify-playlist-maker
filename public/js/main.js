const userYear = document.querySelector("#year-input");
const submitBtn = document.querySelector("#submit-btn");

const getYear = () => {
  console.log(userYear.value);
};

submitBtn.addEventListener("click", getYear);


