document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const carId = urlParams.get('id');
  if (!carId) {
    window.location.href = 'catalog.html';
    return;
  }

  try {
    const res = await fetch(`/api/cars/${carId}`);
    if (!res.ok) throw new Error('Не найдено');
    const car = await res.json();

    document.getElementById('car-title').textContent = `${car.brand} ${car.model} ${car.year}`;
    document.getElementById('car-image').src = `/static/${car.image_url}`;
    document.getElementById('car-price').textContent = `${car.price.toLocaleString('ru-RU')} ₽`;
    
    document.getElementById('car-specs').innerHTML = `
      <li><span>Марка</span> <strong>${car.brand}</strong></li>
      <li><span>Модель</span> <strong>${car.model}</strong></li>
      <li><span>Год выпуска</span> <strong>${car.year}</strong></li>
      <li><span>Тип кузова</span> <strong>${car.body}</strong></li>
      <li><span>Двигатель</span> <strong>${car.engine}</strong></li>
      <li><span>Мощность</span> <strong>${car.power} л.с.</strong></li>
      <li><span>Коробка передач</span> <strong>${car.transmission}</strong></li>
      <li><span>Привод</span> <strong>${car.drive}</strong></li>
      <li><span>Пробег</span> <strong>${car.mileage.toLocaleString('ru-RU')} км</strong></li>
    `;

    document.getElementById('car-content').style.display = 'grid';
    document.getElementById('btn-contact').href = `contact-seller.html?car_id=${car.id}`;

    try {
      const historyKey = 'carshop_history';
      let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      history = history.filter(item => item.id !== car.id);
      
      history.unshift({
        id: car.id,
        brand: car.brand,
        model: car.model,
        price: car.price,
        image_url: car.image_url,
        year: car.year
      });
      
      history = history.slice(0, 10);
      
      localStorage.setItem(historyKey, JSON.stringify(history));
      console.log('История посещений обновлена');
    } catch (e) {
      console.error('Ошибка сохранения истории', e);
    }

    const btnFav = document.getElementById('btn-favorite');
    let isFavorite = false;

    async function updateHeaderCounter() {
      try {
        const favRes = await fetch('/api/favorites');
        if (favRes.ok) {
          const favs = await favRes.json();
          const counter = document.getElementById('compare-count');
          const link = document.getElementById('compare-link');
          if (counter && link) {
            if (favs.length > 0) {
              link.style.visibility = 'visible';
              counter.textContent = favs.length;
            } else {
              link.style.visibility = 'hidden';
            }
          }
        }
      } catch (e) {}
    }

    try {
      const favRes = await fetch('/api/favorites');
      if (favRes.ok) {
        const favs = await favRes.json();
        isFavorite = favs.some(f => f.id === car.id);
        if (isFavorite) {
          btnFav.textContent = 'Убрать из сравнения';
          btnFav.classList.add('btn--ghost');
        } else {
          btnFav.textContent = 'Добавить к сравнению';
          btnFav.classList.remove('btn--ghost');
        }
      }
    } catch (e) {}

    btnFav.addEventListener('click', async () => {
      const method = isFavorite ? 'DELETE' : 'POST';
      const url = isFavorite ? `/api/favorites/${car.id}` : '/api/favorites';
      
      const fetchOptions = { method };
      if (!isFavorite) {
        fetchOptions.headers = { 'Content-Type': 'application/json' };
        fetchOptions.body = JSON.stringify({ car_id: car.id });
      }

      const actionRes = await fetch(url, fetchOptions);

      if (actionRes.ok) {
        isFavorite = !isFavorite;
        if (isFavorite) {
          btnFav.textContent = 'Убрать из сравнения';
          btnFav.classList.add('btn--ghost');
        } else {
          btnFav.textContent = 'Добавить к сравнению';
          btnFav.classList.remove('btn--ghost');
        }
        await updateHeaderCounter();
      } else if (actionRes.status === 401) {
        window.location.href = 'login.html';
      } else {
        alert('Произошла ошибка. Попробуйте позже.');
      }
    });

  } catch (e) {
    document.getElementById('car-title').textContent = 'Автомобиль не найден';
  }
});