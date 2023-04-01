import Parser from 'rss-parser';
import cron from 'node-cron';
import { RSS_FEEDS } from '../configs/constant';
import Logger from '../utils/logger.util';
import { sendMessage } from '../configs/openai';
import { ChatMessage } from '../@types/model';
import client from '../configs/whatsapp';

const parser = new Parser();

const rssService = async (): Promise<void> => {
  // Every day at 12:00 and 22:00
  cron.schedule('0 12,22 * * *', () => {
    RSS_FEEDS.forEach(async (feedUrl) => {
      const { items } = await parser.parseURL(feedUrl);

      items.forEach(async (item) => {
        const { title, link, pubDate, contentSnippet } = item;

        let resMessage = '';

        try {
          const msg = item['content:encodedSnippet'] || contentSnippet;

          const prompt: ChatMessage = {
            message: msg.trim(),
            systemMessage:
              'This is a news article from the RSS feed. Summarize without bias and do not lose details. Keep it short and simple.',
          };

          const res = await sendMessage(prompt);
          resMessage = `\n\n*ChatGPT Summary* \n${res.message}`;
        } catch (err: unknown) {
          Logger.error(`Failed to send message to ChatGPT API: ` + err);
        }

        const message = `*${title}* \n\n*Link* \n${link} \n\n*Date* \n${pubDate} ${resMessage} \n\n*Excerpt* \n${contentSnippet} \n\n*Content* \n${item['content:encodedSnippet']}`;

        client.sendMessage('233541493356@c.us', message);
        // client.sendMessage('233542778775@c.us', message);
      });
    });
  });

  Logger.log('RSS Service started');
};

export default rssService;
