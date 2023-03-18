const slider = document.getElementById("days-slider");
const output = document.getElementById("days-output");
const cityInput = document.getElementById("city-input");

const weather = {
  fetchCity: async function (city) {
    if (city.length < 3)
      return console.log("Name too short");

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const cityData = await response.json();

    if (!cityData.results) {
      return console.log("No city forund");
    }

    this.fetchWeather(
      cityData.results[0].latitude,
      cityData.results[0].longitude
    );

    this.showCity(cityData);
  },

  fetchWeather: function (lat, long) {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m`
    )
      .then((res) => res.json())
      .then((weatherData) => {
        console.log("Fetched weatherData:", weatherData);
        this.showWeather(weatherData);
      });
  },

  showCity: function (data) {
    document.querySelector(
      ".autocomplete-wrapper"
    ).innerHTML = data.results
      .map((res) => {
        return `
          <div
            id="${res.id}"
            class="city-item"
            data-lat=${res.latitude}
            data-long=${res.longitude}
          >
            <p>${res.name} / ${res.admin1}</p>
          </div>
      `;
      })
      .join("");

    const cityItems = Array.prototype.slice.call(
      document.querySelectorAll(".city-item")
    );
    cityItems[0].classList.add("active");

    for (let i = 0; i < cityItems.length; i++) {
      cityItems[i].addEventListener("click", function () {
        weather.fetchWeather(
          this.dataset.lat,
          this.dataset.long
        );

        let current =
          document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(
          " active",
          ""
        );

        this.className += " active";
      });
    }

    console.log("+ Render city list");
  },

  showWeather: function (data) {
    const weatherDiv = document.querySelector(".weather");

    const worker = {
      unit: data.hourly_units.temperature_2m,
      temp: data.hourly.temperature_2m,
      time: data.hourly.time,

      useWorker: function () {
        let segments = [];
        for (let i = 0; i < slider.value; i++) {
          let segment = {
            segmentTemp: this.temp[i] + this.unit,
            segmentTime: this.time[i].slice(-5),
          };
          segments.push(segment);
          // console.log("For loop:", i, "Segment:", segment);
        }
        console.log("Returning segments:", segments);
        return segments;
      },

      showWorker: function () {
        console.log("Rendering segmetns");
        return ` 
        <div class="weather-header">
          <h3>It's currently ${this.temp[0]}${
          this.unit
        }</h3>
        </div>
        <div class="weather-body">
          ${this.useWorker()
            .map(
              (segment) => `
                <div>
                  <p>${segment.segmentTemp}</p>
                  <p>${segment.segmentTime}</p>
                </div>`
            )
            .join("")}
        </div>
      `;
      },
    };

    weatherDiv.innerHTML = worker.showWorker();

    slider.oninput = function () {
      weatherDiv.innerHTML = worker.showWorker();
      output.innerHTML = slider.value;
    };

    console.log("+ Render weather");
  },
};

output.innerHTML = slider.value;
slider.oninput = () => (output.innerHTML = slider.value);

const updateDebounce = debounce((arg) => {
  weather.fetchCity(arg);
});

function debounce(callback, delay = 600) {
  let timeout;
  return (...args) => {
    console.log("Debounceing..");
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(...args);
      console.log("Debounce END");
    }, delay);
  };
}

cityInput.addEventListener("input", (e) =>
  updateDebounce(e.target.value)
);
