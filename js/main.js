const sliderInput = document.getElementById("slider-input");
const daysOutput = document.getElementById("slider-output");
const cityInput = document.getElementById("city-input");
const cityOutput = document.getElementById("city-output");

daysOutput.innerHTML = sliderInput.value;
sliderInput.oninput = () =>
  (daysOutput.innerHTML = sliderInput.value);

const weather = {
  fetchCity: async function (city) {
    if (city.length < 3)
      return (cityOutput.innerHTML = "Name too short");

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const cityData = await response.json();
    log("Fetched CityData:", cityData);

    if (!cityData.results)
      return (cityOutput.innerHTML = "No city found");

    this.checkLocalStorage(
      cityData.results[0].latitude,
      cityData.results[0].longitude,
      cityData.results[0].id
    );

    this.showCity(cityData);
  },

  fetchWeather: function (...args) {
    const [lat, long, id] = args;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m`
    )
      .then((res) => res.json())
      .then((weatherData) => {
        log("Fetched weatherData: ", weatherData);
        saveToLocal(id, weatherData);
        this.showWeather(weatherData);
      });
  },

  checkLocalStorage: function (lat, long, id) {
    const localData = getFromLocal(id);
    if (!localData) {
      log("No data in local storage for id: ", id);
      this.fetchWeather(lat, long, id);
    } else {
      if (localData.timeSaved + 240000 > Date.now()) {
        log("Getting from localStorage for id: ", id);
        this.showWeather(localData);
      } else {
        log("Getting from API for id: ", id);
        this.fetchWeather(lat, long, id);
      }
    }
  },

  showCity: function (data) {
    const autocompDiv = document.querySelector(
      ".autocomplete-wrapper"
    );
    autocompDiv.innerHTML = data.results
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
    for (let city of cityItems) {
      city.addEventListener("click", function () {
        weather.checkLocalStorage(
          this.dataset.lat,
          this.dataset.long,
          this.id
        );

        const current =
          document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(
          " active",
          ""
        );
        this.className += " active";
      });
    }

    log("+ Render city list");
  },

  showWeather: function (data) {
    const weatherDiv = document.querySelector(".weather");

    const worker = {
      unit: data.hourly_units.temperature_2m,
      temp: data.hourly.temperature_2m,
      time: data.hourly.time,

      returnSegments: function () {
        let segments = [];
        for (let i = 0; i < sliderInput.value; i++) {
          const segment = {
            segmentTemp: this.temp[i] + this.unit,
            segmentTime: this.time[i].slice(-5),
          };
          segments.push(segment);
        }
        log("Returning segments:", segments);
        return segments;
      },

      renderSegments: function () {
        log("Rendering segmetns");
        return ` 
        <div class="weather-header">
          <h3>It's currently 
          ${this.temp[0]}
          ${this.unit}
          </h3>
        </div>
        <div class="weather-body">
          ${this.returnSegments()
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

    weatherDiv.innerHTML = worker.renderSegments();

    sliderInput.oninput = function () {
      weatherDiv.innerHTML = worker.renderSegments();
      daysOutput.innerHTML = sliderInput.value;
    };

    log("+ Render weather");
  },
};

const updateDebounce = debounce((arg) => {
  weather.fetchCity(arg);
});

function debounce(callback, delay = 600) {
  let timeout;
  return (...args) => {
    log("Debounceing..");
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(...args);
      log("Debounce END");
    }, delay);
  };
}

cityInput.addEventListener("input", (e) =>
  updateDebounce(e.target.value)
);

function saveToLocal(key, value) {
  log("Saveing to local: ", value, key);
  const timestampValue = {
    ...value,
    timeSaved: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(timestampValue));
}

function getFromLocal(key) {
  log("Getting from storage with key: ", key);
  const dataFromLocal = JSON.parse(
    localStorage.getItem(key)
  );
  return dataFromLocal;
}

function log(...args) {
  console.log(...args);
}

log("file ended");
