document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('compare-content');
  try {
    const res = await fetch('/api/favorites');
    if (res.status === 401) {
      container.innerHTML = '<p>Пожалуйста, <a href="login.html">войдите</a>, чтобы увидеть список сравнения.</p>';
      return;
    }
    const cars = await res.json();
    
    if (cars.length === 0) {
      container.innerHTML = '<p>Вы пока не добавили ни одного автомобиля. Перейдите в <a href="catalog.html">каталог</a>.</p>';
      return;
    }

    // Строим таблицу
    let html = `
      <div class="compare-header">
        <p style="margin:0; font-weight:bold;">Выбрано автомобилей: ${cars.length}</p>
        <button class="btn btn--ghost" id="btn-clear-compare">Очистить сравнение</button>
      </div>
      <div class="table-scroll">
        <table class="compare-table">
          <thead>
            <tr><th>Характеристика</th>`;
    
    cars.forEach(c => html += `<th>${c.brand} ${c.model}</th>`);
    html += `</tr></thead><tbody>`;

    const specs = [
      { label: 'Цена', key: 'price', format: v => v.toLocaleString('ru-RU') + ' ₽' },
      { label: 'Год', key: 'year' },
      { label: 'Кузов', key: 'body' },
      { label: 'Двигатель', key: 'engine' },
      { label: 'Мощность', key: 'power', format: v => v + ' л.с.' },
      { label: 'Коробка', key: 'transmission' },
      { label: 'Привод', key: 'drive' },
      { label: 'Пробег', key: 'mileage', format: v => v.toLocaleString('ru-RU') + ' км' }
    ];

    specs.forEach(spec => {
      html += `<tr><th scope="row">${spec.label}</th>`;
      cars.forEach(c => {
        let val = c[spec.key];
        if (spec.format) val = spec.format(val);
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Обработчик кнопки очистки
    document.getElementById('btn-clear-compare').addEventListener('click', async () => {
      if (!confirm('Вы уверены, что хотите удалить все автомобили из сравнения?')) return;
      
      // Отправляем DELETE-запросы параллельно для всех машин
      await Promise.all(cars.map(car => 
        fetch(`/api/favorites/${car.id}`, { method: 'DELETE' })
      ));
      
      // Перезагружаем страницу, чтобы обновить таблицу и счетчик в шапке
      window.location.reload();
    });

  } catch (e) {
    container.innerHTML = '<p>Ошибка загрузки данных</p>';
  }
});