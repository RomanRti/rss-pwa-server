const newsContainer = document.getElementById('news-container');
const feedSettings = document.getElementById('feed-settings');
const categorySelector = document.getElementById('category-selector');
let selectedCategory = 'default';

function fetchNews() {
  fetch(`/api/news/${selectedCategory}`).then(res => res.json()).then(data => {
    const savedFeeds = getSavedFeeds();
    const sources = [...new Set(data.map(item => item.source))];
    feedSettings.innerHTML = `
      <h3>Выбор лент для уведомлений:</h3>
      ${sources.map(src => `
        <label>
          <input type="checkbox" value="${src}" ${savedFeeds.includes(src) ? 'checked' : ''}>
          ${src}
        </label><br/>
      `).join('')}
      <button onclick="saveFeeds()">Сохранить</button>
    `;

    newsContainer.innerHTML = data.map(item => `
      <div class="news-item">
        <h3>${item.title}</h3>
        <p><strong>${item.source}</strong></p>
        <p>${item.content}</p>
        <small>${new Date(item.pubDate).toLocaleString()}</small>
      </div>
    `).join('');
  });
}

function getSavedFeeds() {
  return JSON.parse(localStorage.getItem('feeds') || '[]');
}

function saveFeeds() {
  const selected = [...feedSettings.querySelectorAll('input[type=checkbox]')]
    .filter(i => i.checked)
    .map(i => i.value);
  localStorage.setItem('feeds', JSON.stringify(selected));
  alert('Сохранено!');
}

categorySelector.addEventListener('change', () => {
  selectedCategory = categorySelector.value;
  fetchNews();
});

window.addEventListener('load', () => {
  fetchNews();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }
});
