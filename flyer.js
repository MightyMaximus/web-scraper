const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.0 Safari/537.36';
const url = 'https://flipp.com/flyers/groceries?postal_code=';
let pc = 'N6H2B1';

class FlyerItem {
    constructor(name, id, store, link) {
        this.name = name; // string
        this.id = id; // number
        this.store = store; // string
        this.link = link; // string
    }

    setPrice(price) {
        this.price = price; // number
    }

    setServing(serving) {
        this.serving = serving; // string
    }
}

function Store(name, link) {
    this.name = name;
    this.link = link;
}

const items = [];
const links = [];

(async () => {
    const browser = await puppeteer.launch(
        {
            headless: false,
            slowMo: 250
        }
    );
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.goto(url + pc);
    console.log(pc);
    await page.waitForSelector('.content');
    /*await page.waitFor(2000);*/

    await page.content().then((html) => { // ADD SCROLL
        const $ = cheerio.load(html);
        $('a[class=flyer-container]').each(async function (i) {
            links[i] = new Store($(this).find($('p[class=flyer-name]')).text().trim('Flyer').trimEnd(), 'https://flipp.com' + $(this).attr('href'));
            console.log(links[i].name + ': ' + links[i].link);
        });
    });

    let name, id, store, link;
    for (let i = 0; i < links.length; i++) {
        store = links[i].name;
        await page.goto(links[i].link);
        await page.waitForNavigation();
        await page.waitFor(2000);
        await page.waitForSelector('canvas');
        await page.content().then((html) => {
            const $ = cheerio.load(html);
            $('a[class=item-container]').each(async function () {
                name = $(this).attr('aria-label');
                id = Number($(this).attr('itemid'));
                link = 'https://flipp.com' + $(this).attr('href');
                items.push(new FlyerItem(name, id, store, link));
            });
        });
    }
    console.log(items.length);
    for (let i = 0; i < items.length; i++) {
        await page.goto(items[i].link);
        await page.waitForNavigation();
        await page.waitFor(1000);
        await page.waitForSelector('flipp-item-dialog');
        await page.content().then((html) => {
            const $ = cheerio.load(html);
            items[i].setPrice(Number($('flipp-price').attr('value')));
            items[i].setServing($('.description').find($('span')).text());
            console.log(items[i].store + ': ' + items[i].name + ' -- $' + items[i].price);
        });
    }
    await browser.close();
})();
