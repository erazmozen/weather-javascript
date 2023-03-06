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
        if (!data.results) {
          return console.log("no city forund");
        }
        this.fetchWeather(
          data.results[0].latitude,
          data.results[0].longitude
        );

        this.showCity(data);
      });
  },
  fetchWeather: async function (lat, long) {
    await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  },
  showCity: function (data) {
    let results = data.results;
    const autocompleteWrapper = document.querySelector(
      ".autocomplete-wrapper"
    );

    autocompleteWrapper.innerHTML = results
      .map((res) => {
        return `
          <div
            id="${res.id}"
            onclick="weather.fetchWeather(${res.latitude}, ${res.longitude})">
            ${res.name} / ${res.admin1}
          </div>
      `;
      })
      .join("");
    console.log(data.results);
  },
};

const cityInput = document.getElementById("city-input");
cityInput.addEventListener("input", (e) => {
  console.log(e.target.value);
  if (e.target.value.length < 3) return;
  updateDebounce(e.target.value);
});

const updateDebounce = debounce((arg) => {
  weather.fetchCity(arg);
});

function debounce(callback, delay = 600) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
