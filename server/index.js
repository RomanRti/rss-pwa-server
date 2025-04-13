
const express = require('express');
const parser = require('rss-parser');
const webPush = require('web-push');
const path = require('path');
const config = require('./config');

const app = express();
const rss = new parser();

const PORT = process.env.PORT || 3000;
const subscriptions = [];

webPush.setVapidDetails(
  'mailto:example@example.com',
  config.vapidKeys.publicKey,
  config.vapidKeys.privateKey
);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/news/:category', async (req, res) => {
  const category = req.params.category || 'default';
  const feeds = config.feeds[category];
  if (!feeds) return res.status(400).send('Category not found');
  try {
    const allNews = [];
    for (const feed of feeds) {
      const data = await rss.parseURL(feed.url);
      data.items.forEach(item => {
        allNews.push({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          content: item.contentSnippet,
          source: feed.source
        });
      });
    }
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    res.json(allNews);
  } catch (e) {
    res.status(500).send('RSS fetch error');
  }
});

app.post('/subscribe', (req, res) => {
  const { subscription, selectedFeeds } = req.body;
  subscriptions.push({ subscription, selectedFeeds });
  res.status(201).json({ message: 'Subscribed' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
