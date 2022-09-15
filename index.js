const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const modeSwitch = document.querySelector("#mode-switch");
const cardModeButton = document.querySelector("#card-mode");
const listModeButton = document.querySelector("#list-mode");

const modalTitle = document.querySelector("#movie-modal-title");
const modalImage = document.querySelector("#movie-modal-image");
const modalDate = document.querySelector("#movie-modal-date");
const modalDescription = document.querySelector("#movie-modal-description");

const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
const movies = [];
// 創建一個專門只儲存id的localStorage，用來渲染頁面時確認是否已加入收藏。
// 經助教建議後移除
// const favoriteMoviesId =
//   JSON.parse(localStorage.getItem("favoriteMoviesID")) || [];
let filteredMovies = [];
const MOVIES_PER_PAGE = 12;
// 切換顯示模式時，維持現有分頁。
let currentPage = 1;

// 渲染頁面分為卡片模式與清單模式。
// 每一種模式中又分為兩種模式，分別為已加入收藏
function renderMovieList(data) {
  if (dataPanel.dataset.mode === "card-mode") {
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>`;
      // if (favoriteMoviesId.includes(item.id)) 經助教建議後修改為下方
      if (list.some((favoriteMovies) => favoriteMovies.id === item.id)) {
        rawHTML += `
        <div class="card-footer text-muted">
          <button
            class="btn btn-primary btn-show-movie"
            data-bs-toggle="modal"
            data-bs-target="#movie-modal"
            data-id="${item.id}"
          >
            More
          </button>
          <button 
            class="btn btn-danger btn-remove-favorite" 
            data-id="${item.id}"
          >
            X
          </button>
        </div>
      </div>
    </div>
  </div>`;
      } else {
        rawHTML += `<div class="card-footer text-muted">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button 
                  class="btn btn-secondary btn-add-favorite" 
                  data-id="${item.id}"
                  >
                  +
                  </button>
              </div>
            </div>
          </div>
        </div>`;
      }

      dataPanel.innerHTML = rawHTML;
    });
  } else if (dataPanel.dataset.mode === "list-mode") {
    let rawHTML = `<ul class="list-group">`;
    data.forEach((item) => {
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <div class="d-flex">
          <h5 style="left: 0; right: 0 ; margin: auto;">
            ${item.title}
          </h5>
        </div>`;
      // if (favoriteMoviesId.includes(item.id)) 經助教建議後修改為下方
      if (list.some((favoriteMovies) => favoriteMovies.id === item.id)) {
        rawHTML += `
        <div >
          <button
            class="btn btn-primary btn-show-movie"
            data-bs-toggle="modal"
            data-bs-target="#movie-modal"
            data-id="${item.id}"
          >
            More
          </button>
          <button 
            class="btn btn-danger btn-remove-favorite" 
            data-id="${item.id}"
            >
            X
          </button>
        </div>
      </li>`;
      } else {
        rawHTML += `
        <div >
          <button
            class="btn btn-primary btn-show-movie"
            data-bs-toggle="modal"
            data-bs-target="#movie-modal"
            data-id="${item.id}"
          >
            More
          </button>
          <button 
            class="btn btn-secondary btn-add-favorite" 
            data-id="${item.id}"
            >
            +
          </button>
        </div>
      </li>`;
      }
    });
    rawHTML += `</ul>`;
    dataPanel.innerHTML = rawHTML;
  }
}

function addToFavorite(id) {
  const movie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  list.push(movie);
  // favoriteMoviesId.push(id);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
  // localStorage.setItem("favoriteMoviesID", JSON.stringify(favoriteMoviesId));
}

function removeFromFavorite(id) {
  if (!list || !list.length) return;
  const listIndex = list.findIndex((list) => list.id === id);
  if (listIndex === -1) return;
  list.splice(listIndex, 1);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
  // favoriteMoviesId.splice(listIndex, 1);
  // localStorage.setItem("favoriteMoviesID", JSON.stringify(favoriteMoviesId));
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link mt-3" href="#" id="page${page}" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function showMovieModal(id) {
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = `release date: ${data.release_date}`;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `
     <img
                  src="${POSTER_URL + data.image}"
                  alt="movie-poster"
                  class="img-fluid"
                />`;
  });
}

// modal顯示會有前一筆資料的延遲，用此函式消除上一筆資料。
function clearModal() {
  modalTitle.innerText = "";
  modalImage.innerText = "";
  modalDescription.innerText = "";
  modalDate.innerText = "";
}

function changeDisplayMode(displayMode) {
  if (displayMode === dataPanel.dataset.mode) return;
  dataPanel.dataset.mode = displayMode;
  if (displayMode === "list-mode") {
    listModeButton.classList.add("mode-active-color");
    cardModeButton.classList.remove("mode-active-color");
  } else if (displayMode === "card-mode") {
    cardModeButton.classList.add("mode-active-color");
    listModeButton.classList.remove("mode-active-color");
  }
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
    clearModal();
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
    renderMovieList(getMoviesByPage(currentPage));
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id));
    renderMovieList(getMoviesByPage(currentPage));
  }
});

modeSwitch.addEventListener("click", function OnListClicked(event) {
  if (dataPanel.dataset.mode === event.target.id) return;
  if (event.target.matches("#list-mode")) {
    changeDisplayMode("list-mode");
    // 經助教建議，移至changeDisplayMode函式中
    // listModeButton.classList.add("mode-active-color");
    // cardModeButton.classList.remove("mode-active-color");
  } else if (event.target.matches("#card-mode")) {
    changeDisplayMode("card-mode");
    // cardModeButton.classList.add("mode-active-color");
    // listModeButton.classList.remove("mode-active-color");
  }
  renderMovieList(getMoviesByPage(currentPage));
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredMovies = movies.filter((movie) =>
    movie.title.trim().toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字 ${keyword} 沒有符合條件的電影`);
  }
  currentPage = 1;
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(currentPage));
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  currentPage = page;
  // 以active顯示所在頁碼。
  const activeItem = document.querySelector(".active");
  if (activeItem) {
    activeItem.classList.remove("active");
  }
  if (currentPage !== 1) {
    const firstPage = document.querySelector("#page1");
    firstPage.classList.remove("active");
  }
  event.target.classList.add("active");
  renderMovieList(getMoviesByPage(currentPage));
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    // 第一頁頁碼無法靠點擊添加active，所以直接在一開始就渲染。
    if (currentPage === 1) {
      const firstPage = document.querySelector("#page1");
      firstPage.classList.add("active");
    }
    renderMovieList(getMoviesByPage(currentPage));
  })
  .catch((err) => {
    console.log(err);
  });
