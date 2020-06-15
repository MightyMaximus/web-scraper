const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const firebase = require('./firebase');

const FlyerItem = require('./structs/FlyerItem.model');
const launch = require('./inputs/launch.json');
const stores = require('./inputs/stores.json');

const db = firebase.initApp;
const pc = launch.pc;
const items = [];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(launch.ua);
    await page.goto(launch.url + pc);
    await page.waitForSelector('.content');

    let name, id, shop, link, price;
    for (let store of stores.stores) { // get all items at each store
        shop = store.name;
        await page.goto(store.link);
        await page.waitForNavigation();
        await page.waitFor(2000);
        await page.waitForSelector('canvas');
        await page.content().then((html) => {
            const $ = cheerio.load(html);
            $('a[class=item-container]').each(async function () {
                name = $(this).attr('aria-label');
                id = Number($(this).attr('itemid'));
                link = 'https://flipp.com' + $(this).attr('href');
                items.push(new FlyerItem(name, id, shop, link));
            });
        });
    }
    for (let item of items) { // get prices for each item
        await page.goto(item.link);
        await page.waitForNavigation();
        await page.waitFor(1000);
        await page.waitForSelector('flipp-item-dialog');
        await page.content().then(async (html) => {
            const $ = cheerio.load(html);
            price = Number($('flipp-price').attr('value'));
            if (!isNaN(price)) {
                item.setPrice(price);
                item.setServing($('.description').find($('span')).text());
                db.collection('general-flyers').add(JSON.parse(JSON.stringify(item))).catch(err => console.log(err));
                console.log(item.toString());
            } else { // if an invalid flyer item was included
                items.splice(item, 1);
            }
        });
    }
    await browser.close();
})();
