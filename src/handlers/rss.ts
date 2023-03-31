import Parser from 'rss-parser';
import { RSS_FEEDS } from '../configs/constant';
import client from '../configs/whatsapp';

const parser = new Parser();

const rssService = async (): Promise<void> => {
  RSS_FEEDS.forEach(async (feedUrl) => {
    const { items } = await parser.parseURL(feedUrl);

    items.forEach((item) => {
      const { title, link, pubDate, contentSnippet } = item;

      const message = `*${title}* \n\n *Link* \n ${link} \n\n *Date* \n${pubDate} \n\n *Excerpt* \n${contentSnippet} \n\n *Content* \n${item['content:encodedSnippet']}`;
      client.sendMessage('233541493356@c.us', message);
    });
  });
};

export default rssService;
