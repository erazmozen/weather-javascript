const weather = {
  fetchCity: async function (city) {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const cityData = await response.json();
    console.log("Fetched cityData", cityData);

    if (!cityData.results) {
      return console.log("no city forund");
    }

    console.log("Starting fetchWeather from fetchCity");
    this.fetchWeather(
      cityData.results[0].latitude,
      cityData.results[0].longitude
    );

    console.log("Starting showCity from fetchCity");
    this.showCity(cityData);
  },

  fetchWeather: function (lat, long) {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m`
    )
      .then((res) => res.json())
      .then((weatherData) => {
        console.log("Fetched weatherData:", weatherData);
        console.log("Calling showWeather");
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
        console.log("Calling fetchWeater from showCity");
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
    const HOURSTOSHOW = 12;

    const showWeather = document.querySelector(".weather");
    const currentHour = new Date().getHours();

    const tempByHour = data.hourly.temperature_2m;
    const timeByHour = data.hourly.time;
    const unit = data.hourly_units.temperature_2m;

    const worker = {
      temp: tempByHour.slice(
        currentHour,
        currentHour + HOURSTOSHOW
      ),
      time: timeByHour.slice(
        currentHour,
        currentHour + HOURSTOSHOW
      ),
      useWorker: function () {
        console.log("Assembling segments");
        let segments = [];
        for (let i = 0; i < HOURSTOSHOW; i++) {
          let segment = {
            segmentTemp: this.temp[i] + unit,
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
          <h3>It's currently ${this.temp[0]}${unit}</h3>
        </div>
        <div class="weather-body" >
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

    showWeather.innerHTML = worker.showWorker();

    console.log("+ Render weather");
  },
};

const cityInput = document.getElementById("city-input");

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

cityInput.addEventListener("input", (e) => {
  if (e.target.value.length < 3)
    return console.log("Name too short");

  console.log("Passing input..", e.target.value);

  updateDebounce(e.target.value);
});
