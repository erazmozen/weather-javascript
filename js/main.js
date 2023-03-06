console.log("started");

const root = document.getElementById("root");

const weather = {
  fetchCity: async function (city) {
    await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  },
};

const cityInput = document.getElementById("city-input");
cityInput.addEventListener("input", (e) => {
  console.log(e.target.value);
  if (e.target.value.length < 3) return;
  weather.fetchCity(e.target.value);
});
