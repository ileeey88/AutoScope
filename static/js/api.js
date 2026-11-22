const rateElement = document.getElementById('exchange-rate');

async function loadExchangeRate() {
  const url = 'https://www.cbr-xml-daily.ru/daily_json.js';

  try {
    rateElement.textContent = 'Курс ЦБ: загрузка...';

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Сервер вернул ошибку');
    }

    const data = await response.json();
    const usdRate = data.Valute.USD.Value;

    rateElement.textContent = `Курс ЦБ: 1 USD = ${usdRate.toFixed(2)} ₽`;
  } catch (error) {
    rateElement.textContent = 'Не удалось загрузить курс валют';
    console.error('Ошибка API:', error);
  }
}
loadExchangeRate();