const apiKey = '499300ac3922cee690584f1460cd08d0';
const imagePath = 'https://image.tmdb.org/t/p/w1280';

const searchInput = document.querySelector('.search input');
const searchButton = document.querySelector('.search button');
const watchlistTitle = document.querySelector('.watchlist h1');
const watchlistGrid = document.querySelector('.watchlist .grid-movies');

const popularElement = document.querySelector('.popular .grid-movies');

const popupModal = document.querySelector('.modal-popup');

function addClickEffectToCard(cards) {
    cards.forEach(card => {
        card.addEventListener('click', () => showPopup(card));
    });
}

const homeButton = document.querySelector('.home-btn');

let currentSection = 'home'; // Default to 'home'

// Add a variable to track whether the user is in search results
searchButton.addEventListener('click', async () => {
    currentSection = 'search'; // Set to 'search' when searching
    await addSearchedMovies(); // Show search results
});



homeButton.addEventListener('click', async () => {
    currentSection = 'home'; // Set to 'home' when clicking home
    watchlistGrid.innerHTML = ''; // Clear previous display

    const movieIds = getLocalStorage();
    if (movieIds.length > 0) {
        watchlistTitle.innerText = 'Watchlist';
        await fetchFavoriteMovies(); // Show watch list
    } else {
        watchlistTitle.innerText = 'Now Playing';
        await addPopular(); // Show trending movies if watch list is empty
    }
});

// search movies
async function getMovieBySearch(searchTerm) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchTerm}`);
    const responseData = await response.json();
    return responseData.results;
}

searchButton.addEventListener('click', addSearchedMovies);

async function addSearchedMovies() {
    // hide suggestions
    suggestionsContainer.style.display = 'none';

    const data = await getMovieBySearch(searchInput.value);
    watchlistTitle.innerText = 'Results';
    watchlistGrid.innerHTML = data.map(e => {
        return `
            <div class="movie-card" data-id="${e.id}">
                <div class="img">
                    <img src="${imagePath + e.poster_path}" alt="${e.title}">
                </div>
                <div class="info">
                    <h2>${e.title}</h2>
                    <div class="movie-card-info">
                        <p>Release Date:</p>
                        <p>${e.release_date || e.first_air_date}</p>
                    </div>
                    <div class="movie-card-info">
                        <p>Rate: </p>
                        <p>${e.vote_average}</p>
                    </div>
                    <div class="movie-card-info">
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const cards = document.querySelectorAll('.movie-card');
    addClickEffectToCard(cards);
}

// popup
async function getMovieById(id) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
    const responseData = await response.json();
    return responseData;
}

async function getMovieTrailer(id) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`);
    const responseData = await response.json();
    return responseData.results[0]?.key || null;
}

async function getMainCastNamesById(id) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`);
    const responseData = await response.json();

    // sort by order, take only top 5 main cast members, and map to get names
    const mainCastNames = responseData.cast
        .sort((a, b) => a.order - b.order)  // sort by order
        .slice(0, 5)  // limit to 5 main cast members
        .map(member => member.name)
        .join("<br>");  // extract names

    return mainCastNames;
}

async function getMainCrewInfoById(id) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`);
    const responseData = await response.json();
    
    // filter for main crew roles and limit to 5 entries
    const mainRoles = ["Director", "Producer", "Executive Producer", "Writer", "Composer"];
    const mainCrewInfo = responseData.crew
        .filter(member => mainRoles.includes(member.job))  // only include main roles
        .slice(0, 5)  // limit to 5 people
        .map(member => `${member.job}: ${member.name}`)
        .join("<br>"); // format with line breaks

    return mainCrewInfo;
}

async function showPopup(card) {
    popupModal.classList.add('show-popup');

    const movieId = card.getAttribute('data-id');
    const movie = await getMovieById(movieId);
    const movieTrailer = await getMovieTrailer(movieId);
    const movieCast = await getMainCastNamesById(movieId);
    const movieCrew = await getMainCrewInfoById(movieId);

    popupModal.style.background = `linear-gradient(hsla(0, 0%, 0%, 0.7), hsla(0, 0%, 0%, 1)), url(${imagePath + movie.backdrop_path})`;
    popupModal.style.backgroundSize = "cover";
    popupModal.style.backgroundRepeat = "no-repeat";
    popupModal.style.backgroundPosition = "center center";

    popupModal.innerHTML = `
        <p class="back-btn"><i class='bx bx-left-arrow-circle'></i></p>
        <div class="content">
            <div class="left">
                <div class="poster-img">
                    <img src="${imagePath + movie.poster_path}" alt="${movie.title}">
                </div>
                <div class="movie-card-info">
                    <p>Add to Watchlist:</p>
                    <p class="plus-icon"><i class='bx bx-bookmark-plus'></i></p>
                </div>
            </div>
            <div class="right">
                <h1>${movie.title || movie.name}</h1>
                <h3>${movie.tagline}</h3>
                <div class="overview">
                    <h2>Overview</h2>
                    <p>${movie.overview}</p>
                </div>
                <div class="movie-card-info container">
                    <div class="movie-card-info">
                    </div>
                    <div class="movie-card-info">
                        <p>Duration: </p>
                        <p>${movie.runtime} minutes</p>
                    </div>
                    <div class="movie-card-info">
                        <p>Rate: </p>
                        <p>${movie.vote_average}</p>
                    </div>
                    <div class="movie-card-info">
                        <p>Release Date: </p>
                        <p>${movie.release_date || movie.first_air_date}</p>
                    </div>
                </div>
                <div class="movie-cast">
                    <h2>Starring</h2>
                    <p>${movieCast}</p>
                </div>
                <div class="crew-info">
                    <h2>Crew</h2>
                    <p>${movieCrew}</p>
                </div>
                <div class="genres">
                    <h2>Genres</h2>
                    <ul>
                        ${movie.genres.map(e => `<li>${e.name}</li>`).join('')}
                    </ul>
                </div>
                <div class="trailer">
                    <h2>Trailer</h2>
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/${movieTrailer}" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    `;

    const backButton = document.querySelector('.back-btn');
    backButton.addEventListener('click', () => popupModal.classList.remove('show-popup'));

    const plusIcon = popupModal.querySelector('.plus-icon');

    const movieIds = getLocalStorage();
    for (let i = 0; i < movieIds.length; i++) { // changed loop condition
        if (movieIds[i] === movieId) {
            plusIcon.classList.add('change-color');
        }
    }

    plusIcon.addEventListener('click', () => {
        if (plusIcon.classList.contains('change-color')) {
            removeLocalStorage(movieId);
            plusIcon.classList.remove('change-color');
        } else {
            addToLocalStorage(movieId);
            plusIcon.classList.add('change-color');
        }
        fetchFavoriteMovies();

        // conditionally update based on current section
        if (currentSection === 'search') {
            addSearchedMovies(); // stay on search results if in search
        }
    });
}

async function addSearchedMovies() {
    suggestionsContainer.style.display = 'none';

    const data = await getMovieBySearch(searchInput.value);
    watchlistTitle.innerText = 'Results';
    watchlistGrid.innerHTML = data.map(e => {
        return `
            <div class="movie-card" data-id="${e.id}">
                <div class="img">
                    <img src="${imagePath + e.poster_path}" alt="${e.title}">
                </div>
                <div class="info">
                    <h2>${e.title}</h2>
                    <div class="movie-card-info">
                        <p>Release Date:</p>
                        <p>${e.release_date || e.first_air_date}</p>
                    </div>
                    <div class="movie-card-info">
                        <p>Rate: </p>
                        <p>${e.vote_average}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const cards = document.querySelectorAll('.movie-card');
    addClickEffectToCard(cards);
}

// local Storage
function getLocalStorage() {
    const movieIds = JSON.parse(localStorage.getItem('movie-id'));
    return movieIds === null ? [] : movieIds;
}

function addToLocalStorage(id) {
    const movieIds = getLocalStorage();
    localStorage.setItem('movie-id', JSON.stringify([...movieIds, id]));
}

function removeLocalStorage(id) {
    const movieIds = getLocalStorage();
    localStorage.setItem('movie-id', JSON.stringify(movieIds.filter(e => e !== id)));
}

function toggleWatchlistTitle() {
    const watchlistTitleElement = document.querySelector('.watchlist h1');
    const movieIds = getLocalStorage();

    if (movieIds.length > 0) {
        watchlistTitleElement.classList.remove('hidden'); // show the title
    } else {
        watchlistTitleElement.classList.add('hidden'); // hide the title
    }
}

// call this function after fetching favorite movies
fetchFavoriteMovies();

async function fetchFavoriteMovies() {
    watchlistGrid.innerHTML = '';
    const moviesLS = getLocalStorage();
    const movies = [];
    for (let i = 0; i < moviesLS.length; i++) { // changed loop condition
        const movieId = moviesLS[i];
        let movie = await getMovieById(movieId);
        addWatchlistFromLS(movie);
        movies.push(movie);
    }
    toggleWatchlistTitle();
}

function addWatchlistFromLS(movieData) {
    watchlistGrid.innerHTML += `
        <div class="movie-card" data-id="${movieData.id}">
            <div class="img">
                <img src="${imagePath + movieData.poster_path}" alt="${movieData.title}">
            </div>
            <div class="info">
                <h2>${movieData.title}</h2>
                <div class="movie-card-info">
                    <p>Release Date: </p>
                    <p>${movieData.release_date || movieData.first_air_date}</p>
                </div>
                <div class="movie-card-info">
                    <p>Rate: </p>
                    <p>${movieData.vote_average}</p>
                </div>
                <div class="movie-card-info">
                </div>
            </div>
        </div>
    `;
    
    const cards = document.querySelectorAll('.movie-card');
    addClickEffectToCard(cards);
}

// trending Movies
getPopularMovies();

async function getPopularMovies() {
    const response = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`);
    const responseData = await response.json();
    return responseData.results;
}

addPopular();

async function addPopular() {
    const data = await getPopularMovies();

    popularElement.innerHTML = data.slice(0, 20).map(e => `
        <div class="movie-card" data-id="${e.id}">
            <div class="img">
                <img src="${imagePath + e.poster_path}" alt="${e.title}">
            </div>
            <div class="info">
                <h2>${e.title || e.name}</h2>
                <div class="movie-card-info">
                    <p>Release Date: </p>
                    <p>${e.release_date || e.first_air_date}</p>
                </div>
                <div class="movie-card-info">
                    <p>Rate: </p>
                    <p>${e.vote_average}</p>
                </div>
            </div>
        </div>
    `).join('');

    const cards = document.querySelectorAll('.popular .movie-card');
    addClickEffectToCard(cards);
}

const suggestionsContainer = document.querySelector('.suggestions');

searchInput.addEventListener('input', async () => {
    const searchTerm = searchInput.value;

    if (searchTerm.length > 2) { // only search when input is meaningful
        const results = await getMovieBySearch(searchTerm);

        suggestionsContainer.style.display = 'block';
        suggestionsContainer.innerHTML = results.map(movie => `
            <div data-id="${movie.id}">${movie.title || movie.name}</div>
        `).join('');

        // add click event to each suggestion
        const suggestions = document.querySelectorAll('.suggestions div');
        suggestions.forEach(suggestion => {
            suggestion.addEventListener('click', async () => {
                const movieId = suggestion.getAttribute('data-id');
                const movie = await getMovieById(movieId);
                showPopup({ getAttribute: () => movieId }); // open the modal for the selected movie
                suggestionsContainer.style.display = 'none';
            });
        });
    } else {
        suggestionsContainer.style.display = 'none';
    }
});
