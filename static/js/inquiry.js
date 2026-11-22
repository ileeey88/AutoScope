document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const carId = urlParams.get('car_id');
  if (!carId) {
    window.location.href = 'catalog.html';
    return;
  }

  document.getElementById('inquiry-car-id').value = carId;

  try {
    const res = await fetch(`/api/cars/${carId}`);
    if (!res.ok) throw new Error('Авто не найдено');
    const car = await res.json();
    
    document.getElementById('seller-car-title').textContent = `${car.brand} ${car.model}`;
    
    const img = document.getElementById('seller-car-image');
    img.src = `/static/${car.image_url}`;
    img.alt = `${car.brand} ${car.model}`;
    
    document.getElementById('seller-car-price').textContent = `${car.price.toLocaleString('ru-RU')} ₽`;
    
    document.getElementById('seller-car-info').innerHTML = `
      <p><strong>Год:</strong> ${car.year}</p>
      <p><strong>Двигатель:</strong> ${car.engine} (${car.power} л.с.)</p>
      <p><strong>КПП:</strong> ${car.transmission} · <strong>Привод:</strong> ${car.drive}</p>
      <p><strong>Пробег:</strong> ${car.mileage.toLocaleString('ru-RU')} км</p>
    `;
  } catch (e) {
    document.getElementById('seller-car-title').textContent = 'Автомобиль не найден';
    document.getElementById('seller-car-image').style.display = 'none';
  }

  const form = document.getElementById('inquiry-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Валидация
    let isValid = true;
    if (name.length < 2) { 
      document.getElementById('name-error').textContent = 'Минимум 2 символа'; 
      isValid = false; 
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) { 
      document.getElementById('email-error').textContent = 'Неверный email'; 
      isValid = false; 
    }
    
    if (message.length < 10) { 
      document.getElementById('message-error').textContent = 'Минимум 10 символов'; 
      isValid = false; 
    }

    if (!isValid) return;

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          car_id: Number(carId), 
          name, 
          email, 
          phone: phone || null, 
          message 
        })
      });

      if (res.ok) {
        form.classList.add('hidden');
        document.getElementById('form-success').classList.remove('hidden');
      } else {
        const err = await res.json();
        alert('Ошибка отправки: ' + (err.detail || 'Попробуйте позже'));
      }
    } catch (err) {
      alert('Нет соединения с сервером');
    }
  });
});