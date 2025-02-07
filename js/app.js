// =======================
// Funcionalidad del Clima
// =======================

// Configuración inicial
let currentUnit = 'metric';
let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

// Elementos del DOM
const elements = {
  cityInput: document.getElementById('city-input'),
  searchBtn: document.getElementById('search-btn'),
  locationBtn: document.getElementById('location-btn'),
  weatherInfo: document.getElementById('weather-info'),
  loadingSpinner: document.querySelector('.loading-spinner'),
  weatherIcon: document.getElementById('weather-icon'),
  temperature: document.getElementById('temperature'),
  cityName: document.getElementById('city-name'),
  weatherCondition: document.getElementById('weather-condition'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  feelsLike: document.getElementById('feels-like'),
  unitCelsius: document.getElementById('unit-celsius'),
  unitFahrenheit: document.getElementById('unit-fahrenheit'),
  searchHistory: document.getElementById('search-history')
};

// Función principal para obtener el clima
async function getWeather(city, units = 'metric') {
  try {
    showLoading();
    const apiKey = '7f18a7c52ce8ca490ed9fb92f70b3aee';
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}&lang=es`
    );
    
    if (!response.ok) throw new Error('Ciudad no encontrada');
    
    const data = await response.json();
    updateWeatherUI(data);
    updateSearchHistory(city);
    updateBackground(data.weather[0].main);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Actualizar la interfaz con los datos del clima
function updateWeatherUI(data) {
  elements.weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
  elements.temperature.textContent = `${Math.round(data.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
  elements.weatherCondition.textContent = data.weather[0].description;
  elements.humidity.textContent = `${data.main.humidity}%`;
  elements.wind.textContent = `${Math.round(data.wind.speed)} ${currentUnit === 'metric' ? 'km/h' : 'mph'}`;
  elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
}

// Manejar cambio de unidades
function toggleUnits(unit) {
  currentUnit = unit;
  // Extraemos la ciudad solo si se ha buscado previamente
  let city = elements.cityName.textContent.split(',')[0].trim();
  if (city && city !== "Busca una ciudad") {
    getWeather(city, unit);
  }
  
  elements.unitCelsius.classList.toggle('active', unit === 'metric');
  elements.unitFahrenheit.classList.toggle('active', unit === 'imperial');
}

// Geolocalización
function getLocationWeather() {
  if (!navigator.geolocation) {
    showError('La geolocalización no es soportada por tu navegador');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(async position => {
    try {
      showLoading();
      const apiKey = '7f18a7c52ce8ca490ed9fb92f70b3aee';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=${currentUnit}&appid=${apiKey}&lang=es`
      );
      
      if (!response.ok) throw new Error('Error al obtener ubicación');
      
      const data = await response.json();
      updateWeatherUI(data);
      updateSearchHistory(data.name);
      updateBackground(data.weather[0].main);
    } catch (error) {
      showError(error.message);
    } finally {
      hideLoading();
    }
  }, error => {
    showError('No se pudo obtener la ubicación. Asegúrate de haber concedido permisos.');
  });
}

// Historial de búsquedas
function updateSearchHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.unshift(city);
    if (searchHistory.length > 5) searchHistory.pop();
    localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    renderSearchHistory();
  }
}

function renderSearchHistory() {
  elements.searchHistory.innerHTML = searchHistory
    .map(city => `<button class="history-item" onclick="getWeather('${city}')">${city}</button>`)
    .join('');
}

// Event Listeners para el clima
elements.searchBtn.addEventListener('click', () => {
  const city = elements.cityInput.value.trim();
  if (city) {
    getWeather(city, currentUnit);
  }
});

elements.locationBtn.addEventListener('click', getLocationWeather);

elements.unitCelsius.addEventListener('click', () => toggleUnits('metric'));
elements.unitFahrenheit.addEventListener('click', () => toggleUnits('imperial'));

elements.cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && elements.cityInput.value.trim()) {
    getWeather(elements.cityInput.value.trim(), currentUnit);
  }
});

// Funciones de utilidad para el clima
function showLoading() {
  elements.loadingSpinner.style.display = 'block';
  elements.weatherInfo.style.opacity = '0.5';
}

function hideLoading() {
  elements.loadingSpinner.style.display = 'none';
  elements.weatherInfo.style.opacity = '1';
}

function showError(message) {
  elements.weatherInfo.innerHTML = `<p class="error">⚠️ ${message}</p>`;
}

function updateBackground(weatherCondition) {
  const body = document.body;
  let gradient;
  
  switch(weatherCondition.toLowerCase()) {
    case 'clear':
      gradient = 'linear-gradient(160deg, #56CCF2 0%, #2F80ED 100%)';
      break;
    case 'rain':
      gradient = 'linear-gradient(160deg, #4B79A1 0%, #283E51 100%)';
      break;
    case 'clouds':
      gradient = 'linear-gradient(160deg, #BBD2C5 0%, #536976 100%)';
      break;
    default:
      gradient = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
  }
  
  body.style.background = gradient;
}

// =======================
// Funcionalidad del Chat
// =======================

// Selección de elementos del chat
const openChatBtn = document.getElementById('open-chat');
const closeChatBtn = document.getElementById('close-chat');
const chatBox = document.getElementById('chat-box');
const chatMessages = document.querySelector('#chat-box .chat-messages');
const chatInput = document.getElementById('chat-input');

// Función para abrir el chat (se agrega la clase "active")
openChatBtn.addEventListener('click', () => {
  chatBox.classList.add('active');
  chatInput.focus();
});

// Función para cerrar el chat (se remueve la clase "active")
closeChatBtn.addEventListener('click', () => {
  chatBox.classList.remove('active');
});

// Función para añadir un mensaje a la conversación
function addMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender); // 'user' o 'bot'
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  // Hacemos scroll hasta el final para ver el último mensaje
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Función que procesa el mensaje del usuario y devuelve una respuesta "inteligente"
 * con respuestas variadas y aleatorias para dar una sensación de conversación.
 */
function getBotResponse(message) {
  const msg = message.toLowerCase();

  // Respuestas aleatorias para saludos
  if (/\b(hola|buenos días|buenas tardes|buenas noches)\b/.test(msg)) {
    const responses = [
      "¡Hola! ¿Cómo estás?",
      "¡Saludos! ¿En qué puedo ayudarte hoy?",
      "¡Hola, qué gusto verte! ¿Qué necesitas?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Respuestas para consultas sobre el clima
  if (/\b(clima|temperatura|pronóstico|tiempo)\b/.test(msg)) {
    return "Para consultar el clima, ingresa el nombre de la ciudad en la barra de búsqueda principal o dime el nombre de la ciudad.";
  }
  
  // Respuestas sobre la empresa
  if (/\b(nosotros|acerca|empresa|quiénes somos)\b/.test(msg)) {
    return "Somos ClimaPlus, comprometidos a ofrecer la información meteorológica más precisa y actualizada. ¡Visita la sección Acerca de Nosotros para conocer más!";
  }
  
  // Respuestas de ayuda
  if (msg.includes("ayuda")) {
    return "Claro, dime en qué necesitas ayuda. Puedes preguntarme sobre el clima, la empresa o cualquier otra cosa.";
  }
  
  // Respuestas para agradecimientos
  if (msg.includes("gracias")) {
    const responses = [
      "¡De nada!",
      "No hay de qué, siempre a tu servicio.",
      "¡Con gusto!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Respuestas para despedidas
  if (/\b(adiós|chao|hasta luego)\b/.test(msg)) {
    return "¡Hasta luego! No dudes en volver si necesitas algo.";
  }
  
  // Si el mensaje parece ser solo un nombre (posible ciudad) y es lo suficientemente largo,
  // se asume que podría ser una consulta meteorológica.
  if (/^[a-zA-Z\s]+$/.test(message) && msg.length > 2) {
    return `¿Deseas consultar el clima en "${message}"? Puedes hacerlo en la barra de búsqueda principal.`;
  }
  
  // Respuesta por defecto si no se reconoce el mensaje
  return "Lo siento, no entendí tu mensaje. ¿Podrías reformularlo o preguntarme algo más?";
}

// Manejar el envío del mensaje cuando se presiona Enter en el input del chat
chatInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && chatInput.value.trim() !== '') {
    const userMessage = chatInput.value.trim();
    addMessage('user', userMessage); // Añade el mensaje del usuario
    chatInput.value = ''; // Limpia el input

    // Simula una respuesta del bot con un retraso de 1 segundo
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage);
      addMessage('bot', botResponse);
    }, 1000);
  }
});


// Inicialización del historial y de la unidad por defecto
renderSearchHistory();
elements.unitCelsius.classList.add('active');

