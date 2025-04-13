const express = require('express');
const cors = require('cors');
const RSSParser = require('rss-parser');
const webpush = require('web-push');
const path = require('path');

const app = express();
const rss = new RSSParser();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Настройка VAPID прямо в index.js
webpush.setVapidDetails(
  'https://rss-pwa-server.onrender.com',
  'BPa9OZ4A9y7AXXXXXXX-EXAMPLE-KEYXXXXX',
  'xF6Ya1ZXXXXX-EXAMPLE-PRIVATEKEYXXXX'
);

// Пример подписок в памяти
const subscriptions = [];

app.post('/api/feed-title', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const feed = await rss.parseURL(url);
    res.json({ title: feed.title || 'Без названия' });
  } catch (e) {
    console.error('Ошибка загрузки RSS:', e.message);
    res.status(500).json({ error: 'Не удалось загрузить RSS' });
  }
});

app.post('/api/news/custom', async (req, res) => {
  try {
    const feeds = req.body.feeds;
    if (!Array.isArray(feeds) || feeds.length === 0) {
      return res.status(400).json({ error: 'No feeds provided' });
    }

    const allNews = [];

    for (const feed of feeds) {
      try {
        const rssFeed = await rss.parseURL(feed.url);
        const items = rssFeed.items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          content: item.contentSnippet || item.content || '',
          source: feed.source
        }));
        allNews.push(...items);
      } catch (err) {
        console.error(`Ошибка в фиде ${feed.url}:`, err.message);
      }
    }

    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    res.json(allNews);
  } catch (err) {
    console.error('Ошибка в custom feed:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/save-subscription', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  subscriptions.push(subscription);
  console.log('✅ Подписка сохранена:', subscription.endpoint);
  res.status(201).json({ success: true });
});

app.post('/api/push-test', async (req, res) => {
  const { title, body, url } = req.body;

  const payload = JSON.stringify({
    title: title || "Новость",
    body: body || "Это push-уведомление!",
    url: url || "/"
  });

  const results = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      results.push({ endpoint: sub.endpoint, status: "ok" });
    } catch (err) {
      results.push({ endpoint: sub.endpoint, status: "error", error: err.message });
    }
  }

  res.json({ sent: results.length, results });
});

// Запуск
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
