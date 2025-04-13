
module.exports = {
  vapidKeys: {
    publicKey: 'BMEp_FZlwUovUmI3iM2cfXD2tT0a6rL8rnxzy3XjvZx2KCRU6yZf8N7SPBd0v3bwJS69zYZWmubAGMJGM17LgJQ',
    privateKey: '7Cn8NRu4_H4At6VnX3qvAQx1nFuFsOWf6qThWmAhfD8'
  },
  feeds: {
    default: [
      { id: 'feed1', source: 'Example Feed 1', url: 'https://feeds.feedburner.com/TechCrunch/' },
      { id: 'feed2', source: 'Example Feed 2', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml' }
    ],
    marketing: [
      { id: 'feed3', source: 'Marketing Brew', url: 'https://www.marketingbrew.com/feed.xml' }
    ]
  }
};
