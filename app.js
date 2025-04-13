const newsContainer = document.getElementById('news-container');
const feedSettings = document.getElementById('feed-settings');

function getUserFeeds() {
  return JSON.parse(localStorage.getItem('userFeeds') || '[]');
}

function saveUserFeeds(feeds) {
  localStorage.setItem('userFeeds', JSON.stringify(feeds));
}

function addFeed() {
  const url = document.getElementById('feed-url').value.trim();
  const name = document.getElementById('feed-name').value.trim();
  if (!url || !name) return alert('Укажите и ссылку, и название');

  const feeds = getUserFeeds();
  feeds.push({ url, source: name });
  saveUserFeeds(feeds);
  document.getElementById('feed-url').value = '';
  document.getElementById('feed-name').value = '';
  fetchNews();
}

function renderFeedList() {
  const feeds = getUserFeeds();
  if (feeds.length === 0) {
    feedSettings.innerHTML = "<p>Ленты не добавлены</p>";
    return;
  }
  feedSettings.innerHTML = "<h3>Мои ленты:</h3>" + feeds.map(f => `<p><strong>${f.source}</strong><br><small>${f.url}</small></p>`).join('');
}

function fetchNews() {
  const feeds = getUserFeeds();
  if (feeds.length === 0) {
    newsContainer.innerHTML = "<p>Добавьте хотя бы одну RSS-ленту</p>";
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
    })
    .catch(err => {
      console.error(err);
      newsContainer.innerHTML = "<p>Ошибка при загрузке новостей</p>";
    });
}

window.addEventListener('load', () => {
  fetchNews();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }
});
