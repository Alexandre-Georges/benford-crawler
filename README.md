# Benford's law crawler

[Benford's law](https://en.wikipedia.org/wiki/Benford%27s_law) gives us the distribution of first digits that we should expect if numbers are "random".

To verify it this project uses a web crawler that will go from page to page on a specific website and collect numbers. Then a report is generated.

## Installation

```bash
npm install
```

## Usage

```bash
node index.js https://www.website-to-crawl.com
```

Some parameters can be tweaked in the `index.js` and `worker.js` files to improve performances. By default it has 10 workers with a list of 5 urls to crawl and when there is a connection issue workers will retry 3 times before giving up.

## Architecture

This project uses [worker threads](https://nodejs.org/api/worker_threads.html) and [Puppeteer](https://github.com/puppeteer/puppeteer).

Worker threads require a somewhat recent NodeJS version.
