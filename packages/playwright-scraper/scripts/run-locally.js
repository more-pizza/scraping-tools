const { PlaywrightScraper } = require('../dist/index');

const scraper = new PlaywrightScraper({ headless: false });

async function main() {
  await scraper.launch();

  const data = await scraper.scrape(async function (page) {
    await page.goto('https://example.com');
    return { title: await page.title() };
  });
  console.log('Scrape Result:', data);
  
  await scraper.close();
}

main();
