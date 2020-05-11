const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const url = 'https://flipp.com/home';
let pc = 'N6H2B1';

// SCRAPING FLIPP

(async () => {
    const browser = await puppeteer.launch(
        {
            headless: false,
            slowMo: 250
        }
    );
    const tab = await browser.newPage();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.0 Safari/537.36');
    await page.goto(url);
    console.log(pc);
    await page.$eval('input[name=postal_code]', el => el.value = 'N6H2B1');
    await page.click('button[class=flipp-button]');
    await page.waitForNavigation();
    await page.waitForSelector('.search-box');
    await page.$eval('input[type=search]', el => el.value = 'cantaloupe');
    await page.click('button[title=Search]');
    /*await page.waitForNavigation();*/
    await page.waitForSelector('.item-block');
    await page.content().then((html) => {
        console.log('hey');
        const $ = cheerio.load(html);
        $('div[class=item-container]').each(() => {
            /*await tab.goto($())*/
            console.log(el);
        })();
    });
    await browser.close();
})();
