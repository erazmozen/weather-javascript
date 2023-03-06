const weather = {
  fetchCity: async function (city) {
    await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetch city data:", data);

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
        console.log("Fetch weather data:", data);

        this.showWeather(data);
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
            class="city-item"
            onclick="weather.fetchWeather(${res.latitude}, ${res.longitude})">
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
        let current =
          document.getElementsByClassName("active");

        console.log("CityItems", cityItems);

        current[0].className = current[0].className.replace(
          " active",
          ""
        );

        this.className += " active";
      });
    }

    console.log("+ Render city");
  },

  showWeather: function (data) {
    const now = new Date().getHours();
    const nToShow = 12;

    const showWeather = document.querySelector(".weather");

    const tempByHour = data.hourly.temperature_2m;
    const timeByHour = data.hourly.time;
    const unit = data.hourly_units.temperature_2m;

    const worker = {
      temp: tempByHour.slice(now, now + nToShow),
      time: timeByHour.slice(now, now + nToShow),
      useWorker: function () {
        let segments = [];
        for (let i = 0; i < nToShow; i++) {
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
    };

    showWeather.innerHTML = worker
      .useWorker()
      .map(
        (segment) => `
          <div>
            <p>${segment.segmentTemp}</p>
            <p>${segment.segmentTime}</p>
          </div>
          `
      )
      .join("");

    console.log("+ Render weather");
  },
};

const cityInput = document.getElementById("city-input");

cityInput.addEventListener("input", (e) => {
  if (e.target.value.length < 3)
    return console.log("Name too short");

  console.log("Passing input..", e.target.value);

  updateDebounce(e.target.value);
});

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
