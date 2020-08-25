const { workerData, parentPort } = require('worker_threads');
const puppeteer = require('puppeteer');

const MAX_RETRIES = 3;

const isOnDomain = url => url.startsWith(workerData.config.domainName);

let browser = null;
let page = null;

(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
  parentPort.on('message', async message => {
    if (message.type === 'NEW_URLS') {
      await processUrls(message.urls);
    } else if (message.type === 'QUIT') {
      await browser.close();
      process.exit(0);
    }
  });

  const callServer = async (url, retries = 0) => {
    try {
      console.log(`Visiting: ${url}`);
      await page.goto(url);
      // await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });

      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }

      const html = await page.content();
      let bodyText = html.match(/<body[^>]*>(.*)<\/body>/s)[1];
      bodyText = bodyText.replace(/<script[^>]*>(.*?)<\/script>/sg, '');
      bodyText = bodyText.replace(/<style[^>]*>(.*?)<\/style>/sg, '');
      bodyText = bodyText.replace(/<[^>]*>/sg, '|').replace(/<\/[^>]*>/sg, '|');

      const allNumbers = [];
      let numbers = bodyText.match(/[1-9][0-9,\.]*/g);

      if (numbers) {
        // Removes potential dates that skew the results
        numbers = numbers.filter(n => !n.match(/[1-2][0-9]{3}/));
        for (const number of numbers) {
          allNumbers.push({ number, firstDigit: parseInt(number.match(/^[1-9]/)[0]) });
        }
        console.log(allNumbers);
      }

      const elements = await page.$$('a');
      const urlsFound = [];

      for (const element of elements) {
        const hrefHandle = await element.getProperty('href');
        let href = (await hrefHandle.jsonValue());
        href = href.replace(/#.*$/, '');
        href = href.replace(/\/$/, '');
        if (isOnDomain(href) && urlsFound.indexOf(href) === -1) {
          urlsFound.push(href);
        }
      }

      parentPort.postMessage({
        urlProcessed: url,
        result: 'success',
        urlsFound,
        numbers: allNumbers,
      });
    } catch (error) {
      if (retries < MAX_RETRIES) {
        console.log(`Retrying ${url} (${retries + 1}) `);
        await callServer(url, retries + 1);
      } else {
        console.log(`error ${error}`);
        parentPort.postMessage({
          urlProcessed: url,
          result: 'error',
          urlsFound: [],
          numbers: [],
          error,
        });
      }
    }
  }

  const processUrls = async urls => {
    for (const url of urls) {
      await callServer(url);
    }
  };

})();
