let allCars = [];
let favoriteIds = [];

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('filters-form');
  const grid = document.getElementById('catalog-grid');
  const emptyNotice = document.getElementById('empty-notice');
  const toggleBtn = document.getElementById('toggle-filters');
  const advancedFilters = document.getElementById('advanced-filters');

  if (!form || !grid) return;

  loadExchangeRate();

  if (toggleBtn && advancedFilters) {
    toggleBtn.addEventListener('click', () => {
      advancedFilters.classList.toggle('hidden');
      if (advancedFilters.classList.contains('hidden')) {
        toggleBtn.textContent = 'Показать все фильтры ▼';
      } else {
        toggleBtn.textContent = 'Скрыть фильтры ▲';
      }
    });
  }

  try {
    const res = await fetch('/api/cars');
    allCars = await res.json();

    await refreshFavorites();
    fillFilterOptions();
    renderCars(allCars);
  } catch (e) {
    grid.innerHTML = `<p style="color:red;">Ошибка: ${e.message}</p>`;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
  });
  
  form.addEventListener('reset', () => {
    setTimeout(() => renderCars(allCars), 10);
  });

  async function loadExchangeRate() {
    const rateElement = document.getElementById('exchange-rate');
    if (!rateElement) return;

    try {
      rateElement.textContent = 'Курс ЦБ: загрузка...';
      const res = await fetch('/api/exchange-rate');
      if (!res.ok) throw new Error('Ошибка сервера');
      
      const data = await res.json();
      rateElement.textContent = `Курс ЦБ: 1 USD = ${data.usd.toFixed(2)} ₽`;
    } catch (error) {
      rateElement.textContent = 'Не удалось загрузить курс валют';
      console.error('Ошибка API:', error);
    }
  }

  function fillFilterOptions() {
    const brands = [...new Set(allCars.map(c => c.brand))].sort();
    const bodies = [...new Set(allCars.map(c => c.body))].sort();
    const transmissions = [...new Set(allCars.map(c => c.transmission))].sort();
    const drives = [...new Set(allCars.map(c => c.drive))].sort();
    
    const addOptions = (id, values) => {
      const el = document.getElementById(id);
      if (el) values.forEach(v => el.insertAdjacentHTML('beforeend', `<option value="${v}">${v}</option>`));
    };

    addOptions('filter-brand', brands);
    addOptions('filter-body', bodies);
    addOptions('filter-transmission', transmissions);
    addOptions('filter-drive', drives);
  }

  function applyFilters() {
    const f = {
      brand: document.getElementById('filter-brand').value,
      body: document.getElementById('filter-body').value,
      transmission: document.getElementById('filter-transmission').value,
      drive: document.getElementById('filter-drive').value,
      priceMin: document.getElementById('filter-price-min').value,
      priceMax: document.getElementById('filter-price-max').value,
      yearMin: document.getElementById('filter-year-min').value,
      yearMax: document.getElementById('filter-year-max').value,
      mileageMin: document.getElementById('filter-mileage-min').value,
      mileageMax: document.getElementById('filter-mileage-max').value,
      powerMin: document.getElementById('filter-power-min').value,
      powerMax: document.getElementById('filter-power-max').value,
      sort: document.getElementById('filter-sort').value,
    };

    let filtered = allCars.filter(car => {
      if (f.brand && car.brand !== f.brand) return false;
      if (f.body && car.body !== f.body) return false;
      if (f.transmission && car.transmission !== f.transmission) return false;
      if (f.drive && car.drive !== f.drive) return false;

      if (f.priceMin && car.price < Number(f.priceMin)) return false;
      if (f.priceMax && car.price > Number(f.priceMax)) return false;

      if (f.yearMin && car.year < Number(f.yearMin)) return false;
      if (f.yearMax && car.year > Number(f.yearMax)) return false;

      if (f.mileageMin && car.mileage < Number(f.mileageMin)) return false;
      if (f.mileageMax && car.mileage > Number(f.mileageMax)) return false;

      if (f.powerMin && car.power < Number(f.powerMin)) return false;
      if (f.powerMax && car.power > Number(f.powerMax)) return false;

      return true;
    });

    filtered.sort((a, b) => {
      switch (f.sort) {
        case 'price-up':   return a.price - b.price;
        case 'price-down': return b.price - a.price;
        case 'year':       return b.year - a.year;
        case 'mileage':    return a.mileage - b.mileage;
        case 'power':      return b.power - a.power;
        default:           return 0;
      }
    });

    renderCars(filtered);
  }

  function renderCars(cars) {
    if (cars.length === 0) {
      grid.innerHTML = '';
      if (emptyNotice) emptyNotice.classList.remove('hidden');
      return;
    }
    if (emptyNotice) emptyNotice.classList.add('hidden');

    grid.innerHTML = cars.map(car => {
      const isCompared = favoriteIds.includes(car.id);
      const cardClass = isCompared ? 'card is-compared' : 'card';
      const btnText = isCompared ? 'Убрать из сравнения' : 'В сравнение';
      const btnClass = isCompared ? 'btn btn--ghost btn-small' : 'btn btn-small';

      return `
      <li class="${cardClass}" id="card-${car.id}">
        <a class="card__link" href="car.html?id=${car.id}">
          <div class="card__media">
            <img src="/static/${car.image_url}" alt="${car.brand} ${car.model}">
          </div>
        </a>
        <div class="card__body">
          <h2><a class="card__link" href="car.html?id=${car.id}">${car.brand} ${car.model}</a></h2>
          <p>${car.body} · ${car.year} · ${car.engine} · ${car.power} л.с.<br>${car.mileage.toLocaleString('ru-RU')} км</p>
          <p class="card__price">${car.price.toLocaleString('ru-RU')} ₽</p>
          
          <button class="${btnClass} btn-card-compare" data-id="${car.id}">
            ${btnText}
          </button>
        </div>
      </li>
    `}).join('');

    document.querySelectorAll('.btn-card-compare').forEach(btn => {
      btn.addEventListener('click', handleCompareClick);
    });
  }

  async function refreshFavorites() {
    try {
      const favRes = await fetch('/api/favorites');
      if (favRes.ok) {
        const favs = await favRes.json();
        favoriteIds = favs.map(f => f.id);
        
        const counter = document.getElementById('compare-count');
        const link = document.getElementById('compare-link');
        if (counter && link) {
          if (favoriteIds.length > 0) {
            link.style.visibility = 'visible';
            counter.textContent = favoriteIds.length;
          } else {
            link.style.visibility = 'hidden';
          }
        }
      }
    } catch (e) {}
  }

  async function handleCompareClick(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const carId = Number(btn.dataset.id);
    const isCompared = favoriteIds.includes(carId);

    const method = isCompared ? 'DELETE' : 'POST';
    const url = isCompared ? `/api/favorites/${carId}` : '/api/favorites';
    const fetchOptions = { method };
    if (!isCompared) {
      fetchOptions.headers = { 'Content-Type': 'application/json' };
      fetchOptions.body = JSON.stringify({ car_id: carId });
    }

    const res = await fetch(url, fetchOptions);

    if (res.ok) {
      if (isCompared) {
        favoriteIds = favoriteIds.filter(id => id !== carId);
      } else {
        favoriteIds.push(carId);
      }
      
      const card = document.getElementById(`card-${carId}`);
      if (isCompared) {
        card.classList.remove('is-compared');
        btn.textContent = 'В сравнение';
        btn.classList.remove('btn--ghost');
      } else {
        card.classList.add('is-compared');
        btn.textContent = 'Убрать из сравнения';
        btn.classList.add('btn--ghost');
      }
      
      await refreshFavorites();
    } else if (res.status === 401) {
      window.location.href = 'login.html';
    } else {
      alert('Ошибка при добавлении');
    }
  }
});