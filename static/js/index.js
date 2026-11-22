document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('featured-grid');
  try {
    const res = await fetch('/api/cars');
    const cars = await res.json();
    
    // Берем первые 4 машины
    const featured = cars.slice(0, 4);
    grid.innerHTML = featured.map(car => `
      <article class="card">
        <a class="card__link" href="car.html?id=${car.id}">
          <div class="card__media">
            <img src="/static/${car.image_url}" alt="${car.brand} ${car.model}">
          </div>
        </a>
        <div class="card__body">
          <h3><a class="card__link" href="car.html?id=${car.id}">${car.brand} ${car.model}</a></h3>
          <p>${car.engine}, ${car.transmission}, ${car.power} л.с.</p>
          <p class="card__price">${car.price.toLocaleString('ru-RU')} ₽</p>
        </div>
      </article>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<p>Не удалось загрузить автомобили</p>';
  }
});