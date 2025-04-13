const log = (msg) => {
  const out = document.getElementById('debug-log');
  const time = new Date().toLocaleTimeString();
  out.innerHTML += `[${time}] ${msg}<br>`;
};

document.addEventListener('DOMContentLoaded', () => {
  const logBox = document.createElement('div');
  logBox.id = 'debug-log';
  logBox.style.padding = '1rem';
  logBox.style.fontSize = '0.9rem';
  logBox.style.background = '#fff7e6';
  logBox.style.borderTop = '2px solid #ffcc00';
  logBox.style.fontFamily = 'monospace';
  logBox.style.maxHeight = '200px';
  logBox.style.overflowY = 'auto';
  document.body.appendChild(logBox);

  const feedUrlInput = document.createElement('input');
  feedUrlInput.placeholder = "https://example.com/rss.xml";
  feedUrlInput.id = "feed-url";
  feedUrlInput.style.width = "60%";
  document.body.appendChild(feedUrlInput);

  const addButton = document.createElement('button');
  addButton.textContent = "Добавить RSS";
  addButton.onclick = () => {
    const url = feedUrlInput.value.trim();
    if (!url) return log("⛔ Введите ссылку на RSS");

    log("📡 Отправляем запрос на /api/feed-title...");

    fetch('/api/feed-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
      .then(res => {
        log("✅ Ответ от сервера: статус " + res.status);
        return res.json();
      })
      .then(({ title }) => {
        log("📥 Получен заголовок фида: " + title);
        const feeds = JSON.parse(localStorage.getItem('userFeeds') || '[]');
        feeds.push({ url, source: title, category: 'main' });
        localStorage.setItem('userFeeds', JSON.stringify(feeds));
        log("💾 Сохранено в localStorage");
      })
      .catch(err => {
        log("❌ Ошибка: " + err.message);
      });
  };
  document.body.appendChild(addButton);
});
