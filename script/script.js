document.addEventListener('DOMContentLoaded', () => {

	const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
	const SERVER = 'https://api.themoviedb.org/3';
	const API_KEY = 'fa12ae0ede0cc30bc0a03b2a29f4c1a7';

	const leftMenu = document.querySelector('.left-menu'),
		hamburger = document.querySelector('.hamburger'),
		tvShowsList = document.querySelector('.tv-shows__list'),
		modal = document.querySelector('.modal'),
		tvShows = document.querySelector('.tv-shows'),
		tvCardImg = document.querySelector('.tv-card__img'),
		modalTitle = document.querySelector('.modal__title'),
		genresList = document.querySelector('.genres-list'),
		rating = document.querySelector('.rating'),
		desc = document.querySelector('.description'),
		modalLink = document.querySelector('.modal__link'),
		searchForm = document.querySelector('.search__form'),
		searchFormInput = document.querySelector('.search__form-input'),
		preloader = document.querySelector('.preloader'),
		dropdown = document.querySelectorAll('.dropdown'),
		tvShowsHead = document.querySelector('.tv-shows__head'),
		posterWrapper = document.querySelector('.poster__wrapper'),
		modalContent = document.querySelector('.modal__content'),
		pagination = document.querySelector('.pagination');


	const loading = document.createElement('div');
	loading.className = 'loading';

	const DBService = class {
		getData = async (url) => {

			const res = await fetch(url);
			if (res.ok) {
				return res.json();
			}
			else {
				throw new Error(`Не удалось получить данные по адресу ${url}`);
			}
		}
		getTestData = () => {
			return this.getData('test.json');
		}

		getTestCard = () => {
			return this.getData('card.json');
		}

		getSearchResult = query => {
			this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-Ru&page=1`;
			return this.getData(this.temp);
		}

		getNextPage = page => {
			return this.getData(this.temp + '&page=' + page);
		}

		getTvShow = id => this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);

		getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`);

		getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`);

		getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`);

		getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`);

	}

	const dbService = new DBService();

	const renderCard = (response, target) => {
		tvShowsList.textContent = '';
		if (!response.total_results) {
			loading.remove();
			tvShowsHead.textContent = 'К сожалению по Вашему запросу ничего не найдено...';
			tvShowsHead.style.cssText = 'color: tomato;';
			return;
		}

		tvShowsHead.textContent = target ? target.textContent : 'Результат поиска:';
		tvShowsHead.style.cssText = 'color: black;';

		response.results.forEach(({ backdrop_path: backdrop,
			name: title,
			poster_path: poster,
			vote_average: vote,
			id
		}) => {
			const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
			const backdropIMG = backdrop ? IMG_URL + backdrop : '';
			const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

			const card = document.createElement('li');
			card.idTV = id;
			card.classList.add('tv-shows__item');
			card.innerHTML = `
				<a href="#" id="${id}" class="tv-card">
							${voteElem}
							<img class="tv-card__img"
							src="${posterIMG}"
							data-backdrop="${backdropIMG}"
							alt="${title}">
						<h4 class="tv-card__head">${title}</h4>
				</a>
				`;
			loading.remove();
			tvShowsList.append(card);
		});
		pagination.textContent = '';
		if (!target && response.total_pages > 1) {
			for (let i = 1; i <= response.total_pages; i++) {
				pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
			}
		}
	}

	// Поиск по сайту
	searchForm.addEventListener('submit', event => {
		event.preventDefault();
		const value = searchFormInput.value.trim();
		searchFormInput.value = '';
		if (value) {
			tvShows.append(loading);
			dbService.getSearchResult(value).then(renderCard);
		}
	});

	// Открытие и закрытие меню

	const closeDropdown = () => {
		dropdown.forEach(item => {
			item.classList.remove('active');
		})
	};

	hamburger.addEventListener('click', () => {
		leftMenu.classList.toggle('openMenu');
		hamburger.classList.toggle('open');
		closeDropdown();
	});

	document.addEventListener('click', event => {
		const target = event.target;
		if (!target.closest('.left-menu')) {
			leftMenu.classList.remove('openMenu');
			hamburger.classList.remove('open');
			closeDropdown();
		}
	});

	leftMenu.addEventListener('click', event => {
		event.preventDefault();
		const target = event.target;
		const dropdown = target.closest('.dropdown');
		if (dropdown) {
			dropdown.classList.toggle('active');
			leftMenu.classList.add('openMenu');
			hamburger.classList.add('open');
		}

		if (target.closest('#top-rated')) {
			tvShows.append(loading);
			dbService.getTopRated().then((response) => renderCard(response, target));
		}
		if (target.closest('#popular')) {
			tvShows.append(loading);
			dbService.getPopular().then((response) => renderCard(response, target));
		}
		if (target.closest('#today')) {
			tvShows.append(loading);
			dbService.getToday().then((response) => renderCard(response, target));
		}
		if (target.closest('#week')) {
			tvShows.append(loading);
			dbService.getWeek().then((response) => renderCard(response, target));
		}
		if (target.closest('#search')) {
			tvShowsList.textContent = '';
			tvShowsHead.textContent = '';
		}


	});


	// Открытие модального окна
	tvShowsList.addEventListener('click', event => {
		event.preventDefault(); // Что бы список не поднимался на верх, если карточка ссылка(<a></a>).
		const target = event.target;
		const card = target.closest('.tv-card');

		if (card) {
			preloader.style.display = 'block';
			dbService.getTvShow(card.id)
				.then(response => {

					if (response.poster_path) {
						tvCardImg.src = IMG_URL + response.poster_path;
						tvCardImg.alt = response.name;
						posterWrapper.style.display = '';
						modalContent.style.paddingLeft = '';
					}
					else {
						posterWrapper.style.display = 'none';
						modalContent.style.paddingLeft = '25px';
					}
					modalTitle.textContent = response.name;
					// genresList.innerHTML = response.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, ''); Применение reduce();
					genresList.textContent = '';
					for (const item of response.genres) {
						genresList.innerHTML += `<li>${item.name}</li>`;
					}
					'developers.themoviedb.org/3/search/search-companies'
					rating.textContent = response.vote_average;
					desc.textContent = response.overview;
					modalLink.href = response.homepage;
				})
				.then(() => {
					modal.classList.add('visible');
					document.addEventListener('keyup', closeModal);
				})
				.finally(() => {
					preloader.style.display = '';
				});
		}
	});

	// Закрытие модального окна
	const closeModal = event => {
		const target = event.target;
		if (event.keyCode === 27 || target.closest('.cross') || target === modal) {
			modal.classList.remove('visible');
			document.removeEventListener('keyup', closeModal);
		}
	};

	// Смена карточки
	const changeImage = event => {
		const card = event.target.closest('.tv-card__img');
		if (card) {
			if (card.dataset.backdrop) {
				[card.src, card.dataset.backdrop] = [card.dataset.backdrop, card.src]; //Деструктуризация
			}
		}
	};

	// Дополнительные страницы
	const pagesAdd = event => {
		event.preventDefault();
		const target = event.target;
		if (target.classList.contains('pages')) {
			tvShows.append(loading);
			dbService.getNextPage(target.textContent).then(renderCard);
		}
	};











	tvShowsList.addEventListener('mouseover', changeImage);
	tvShowsList.addEventListener('mouseout', changeImage);
	modal.addEventListener('click', closeModal);
	pagination.addEventListener('click', pagesAdd);




});