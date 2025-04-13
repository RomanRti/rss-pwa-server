const newsContainer = document.getElementById('news-container');
const feedSettings = document.getElementById('feed-settings');
const categorySelector = document.getElementById('category-selector');
const settingsPanel = document.getElementById('settings-panel');
document.getElementById('settings-button').onclick = () => {
  settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
};

function getUserFeeds() {
  return JSON.parse(localStorage.getItem('userFeeds') || '[]');
}

function saveUserFeeds(feeds) {
  localStorage.setItem('userFeeds', JSON.stringify(feeds));
}

function addFeed() {
  const url = document.getElementById('feed-url').value.trim();
  if (!url) return alert('Введите ссылку на RSS');

  fetch('/api/feed-title', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
    .then(res => res.json())
    .then(({ title }) => {
      const feeds = getUserFeeds();
      feeds.push({ url, source: title || "Без названия", category: categorySelector.value });
      saveUserFeeds(feeds);
      document.getElementById('feed-url').value = '';
      fetchNews();
    })
    .catch(() => alert("Не удалось загрузить RSS"));
}

function removeFeed(index) {
  const feeds = getUserFeeds();
  feeds.splice(index, 1);
  saveUserFeeds(feeds);
  fetchNews();
}

function renderFeedList() {
  const feeds = getUserFeeds().filter(f => f.category === categorySelector.value);
  if (feeds.length === 0) {
    feedSettings.innerHTML = "<p>Нет подключённых лент</p>";
    return;
  }
  feedSettings.innerHTML = feeds.map((f, i) => `
    <div class="feed-row">
      <div><strong>${f.source}</strong><br><small>${f.url}</small></div>
      <button class="danger" onclick="removeFeed(${i})">✖</button>
    </div>
  `).join('');
}

function fetchNews() {
  const feeds = getUserFeeds().filter(f => f.category === categorySelector.value);
  if (feeds.length === 0) {
    renderFeedList();
    newsContainer.innerHTML = "<p>Нет новостей</p>";
    return;
  }
  fetch("/api/news/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feeds })
  })
    .then(res => res.json())
    .then(data => {
      renderFeedList();
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

categorySelector.addEventListener('change', fetchNews);

window.addEventListener('load', () => {
  fetchNews();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }
});
